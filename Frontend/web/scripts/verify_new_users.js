$('#back_btn').click(() => {
  window.history.back();
});


const request_elements = new Map();
let request_no = 0;

function user_verification_response(wallet_address, response, request_no) {
  user_verification_ws.send(JSON.stringify({
    type: 'user_verification_response',
    data: {
      wallet_address, 
      new_authorization_status: response,
      request_no
    }
  }));
}

function connect_to_websocket() {
  user_verification_ws = new WebSocket(user_verification_ws_url);

  user_verification_ws.addEventListener('open', () => {
    $('#connecting_container').replaceWith(cards_container);
  });
  
  user_verification_ws.addEventListener('error', (event) => {
    console.log('WebSocket error: ', event);
  });
  
  user_verification_ws.addEventListener('close', (event) => {
    cards_container.empty();
    $('#cards_container').replaceWith(
      $('<div/>')
        .attr('id', 'connecting_container')
        .addClass('d-flex align-items-center justify-content-center flex-grow-1')
        .text('Connecting To Server')
    );
    setTimeout(connect_to_websocket, 1000);
  });
  
  user_verification_ws.addEventListener('message', (event) => {
    const { type, data } = JSON.parse(event.data);
  
    if (type == 'user_verification_request') {
      const { authorization_status, ...user_data } = data;
      const { wallet_address } = user_data;
  
      const local_request_no = request_no;
  
      const request_ele = (
        $('<div/>')
          .addClass('w-75 m-auto')
          .append(
            $('<div/>')
              .addClass('card m-3 p-2')
              .append(
                  Object.entries(user_data).map(([key, value]) => {
                    return (
                      $('<div/>')
                        .text(`${key}: ${value}`)
                    );
                  }),
                  $('<div/>')
                    .addClass('text-center')
                    .append(
                      $('<button/>')
                        .text('Authorize')
                        .addClass('btn btn-success m-2')
                        .click(function() {
                          $(this).prop('disabled', true);
                          user_verification_response(wallet_address, 'authorized', local_request_no);
                        }),
                      $('<button/>')
                        .text('Reject')         
                        .addClass('btn btn-danger m-2')
                        .click(function() {
                          $(this).prop('disabled', true);
                          user_verification_response(wallet_address, 'rejected', local_request_no);
                        })    
                    )
              )
          )
      );
  
      request_elements.set(local_request_no, request_ele);
      request_no++;
  
      $('#cards_container').prepend(
        request_ele
      );
    }
    else if (type == 'response_received') {
      console.log(data);
      const { request_no } = data;
  
      if (request_elements.has(request_no)) {
        request_elements.get(request_no).remove();
        request_elements.delete(request_no);
      }
    }
  });
}


const user_verification_ws_url = location.protocol == 'https' ?
  'wss://' : 'ws://'
  + location.host + '/verify_new_users';

// connect to websocket
let cards_container = $('#cards_container').replaceWith(
  $('<div/>')
    .attr('id', 'connecting_container')
    .addClass('d-flex align-items-center justify-content-center flex-grow-1')
    .text('Connecting To Server')
);
let user_verification_ws;
connect_to_websocket();