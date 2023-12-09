import { WebSocketServer } from 'ws';
import http from 'http';
import { get_user_activity, get_pending_requests, add_to_user_activity } from './contract_activity.mjs';
import { wallet_address_from_token } from './user_identification.mjs';
import { get_user, get_unverified_users, change_authorization_status } from './users.mjs';

export function init_sockets(app) {
  const server = http.createServer(app);

  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url;
  
    // parse cookies
    let cookies;
    const { headers: { cookie } } = request;
    if (cookie) {
      cookies = cookie.split(';').reduce((res, item) => {
        const data = item.trim().split('=');
        return { ...res, [data[0]]: data[1] };
      }, {});
    }
  
    const wallet_address = wallet_address_from_token(cookies['access_token']);
    const user_type = get_user(wallet_address).user_type;
  
    if (pathname == '/verify_new_users' && user_type == 'admin') {
      user_verification_ws_server.handleUpgrade(request, socket, head, socket => {
        user_verification_ws_server.emit('connection', socket, request);
      });
    }
    else if (pathname == '/activity') {
      activity_ws_server.handleUpgrade(request, socket, head, socket => {
        activity_sockets.set(socket, wallet_address);
        activity_addresses.set(wallet_address, socket);
        activity_ws_server.emit('connection', socket, request);
      });
    }
    else if (pathname == '/authorize_hospital_requests' && user_type == 'patient') {
      hospital_authorization_ws_server.handleUpgrade(request, socket, head, socket => {
        hospital_authorization_sockets.set(socket, wallet_address);
        hospital_authorization_addresses.set(wallet_address, socket);
        hospital_authorization_ws_server.emit('connection', socket, request);
      });
    }
    else {
      socket.destroy();
    }
  });

  return server;
}

export function update_user_verification_sockets(new_user) {
  user_verification_sockets.forEach(socket => {
    const send_data = {
      type: 'user_verification_request',
      data: new_user
    }

    socket.send(JSON.stringify(send_data));
  });
}

export function update_user_activity_socket(wallet_address, activity) {
  const socket = activity_addresses.get(wallet_address);
  if (socket == undefined) {
    // socket not active
    return;
  }

  const send_data = {
    type: 'activity',
    data: activity
  };
  socket.send(JSON.stringify(send_data));
}

export function update_hospital_authorization_socket(wallet_address, request_data) {
  const socket = hospital_authorization_addresses.get(wallet_address);
  if (socket == undefined) {
    // socket not active
    return;
  }

  const { request_type, ...data } = request_data;

  const send_data = {
    type: 'hospital_authorization_request',
    data
  };
  socket.send(JSON.stringify(send_data)); 
}


const user_verification_sockets = new Set();

const user_verification_ws_server = new WebSocketServer({ noServer: true, path: '/verify_new_users' });
user_verification_ws_server.on('connection', socket => {

  user_verification_sockets.add(socket);

  socket.on('message', message => {
    const { type, data } = JSON.parse(message);

    if (type == 'user_verification_response') {

      const { wallet_address, new_authorization_status } = data;
      change_authorization_status(wallet_address, new_authorization_status);
      const default_admin = '0x0000000000000000000000000000000000000000';
      const timestamp = Date.now();
      add_to_user_activity(default_admin, { 
        event: 'Admin Authorized User',
        timestamp,
        authorized_wallet_address: wallet_address,
        new_authorization_status: new_authorization_status
      });

      const { request_no } = data;
      socket.send(JSON.stringify({ type: 'response_received', data: { request_no } }));
    }
  });

  socket.on('close', () => {
    user_verification_sockets.delete(socket);
  });

  const unverified_users = get_unverified_users();
  unverified_users.reverse().forEach(user => {

    const send_data = {
      type: 'user_verification_request',
      data: user
    }

    socket.send(JSON.stringify(send_data));
  });
});


const activity_sockets = new Map();
const activity_addresses = new Map();

const activity_ws_server = new WebSocketServer({ noServer: true, path: '/activity' });
activity_ws_server.on('connection', socket => {

  socket.on('close', () => {
    activity_addresses.delete(activity_sockets.get(socket));
    activity_sockets.delete(socket);
  }); 

  const activities = get_user_activity(activity_sockets.get(socket));
  activities.reverse().forEach(activity => {

    const send_data = {
      type: 'activity',
      data: activity
    }

    socket.send(JSON.stringify(send_data));
  });
});


const hospital_authorization_sockets = new Map();
const hospital_authorization_addresses = new Map();

const hospital_authorization_ws_server = new WebSocketServer({ noServer: true, path: '/authorize_hospital_requests' });
hospital_authorization_ws_server.on('connection', socket => {

  socket.on('close', () => {
    hospital_authorization_addresses.delete(hospital_authorization_sockets.get(socket));
    hospital_authorization_sockets.delete(socket);
  }); 

  const authorization_requests = get_pending_requests(hospital_authorization_sockets.get(socket));
  authorization_requests.reverse().forEach(request_data => {

    const { request_type, ...data } = request_data;

    const send_data = {
      type: 'hospital_authorization_request',
      data
    };

    socket.send(JSON.stringify(send_data));
  });
});