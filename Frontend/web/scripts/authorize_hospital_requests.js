$('#back_btn').click(() => {
  window.history.back();
});

let id_counter = 0;


function connect_to_websocket() {
  hospital_authorization_ws = new WebSocket(hospital_authorization_ws_url);

  hospital_authorization_ws.addEventListener('open', () => {
    $('#connecting_container').replaceWith(cards_container);
  });
  
  hospital_authorization_ws.addEventListener('error', (event) => {
    console.log('WebSocket error: ', event);
  });
  
  hospital_authorization_ws.addEventListener('close', (event) => {
    cards_container.empty();
    $('#cards_container').replaceWith(
      $('<div/>')
        .attr('id', 'connecting_container')
        .addClass('d-flex align-items-center justify-content-center flex-grow-1')
        .text('Connecting To Server')
    );
    setTimeout(connect_to_websocket, 1000);
  });
  
  hospital_authorization_ws.addEventListener('message', (event) => {
    const { type, data } = JSON.parse(event.data);
  
    if (type == 'hospital_authorization_request') {
      const { request, ...request_data } = data;
      const id = id_counter++;
  
      const request_ele = (
        $('<div/>')
          .addClass('w-75 m-auto')
          .append(
            $('<div/>')
              .addClass('card m-3 p-2')
              .append(
                  $('<b/>')
                   .text(`${'request description'}: ${request}`),
                  Object.entries(request_data).map(([key, value]) => {
                    return (
                      $('<div/>')
                        .text(`${key}: ${value}`)
                    );
                  }),
                  (() => {
                    if (data.blob_id != undefined) {
                      return (
                        $('<a/>')
                        .prop('href', '/blob?' + new URLSearchParams({ blob_uuid: data.blob_id }))
                        .text('view record')
                      );
                    }
                  })(),
                  $('<div/>')
                    .addClass('text-center')
                    .append(
                      $('<button/>')
                        .text('Authorize')
                        .addClass('btn btn-success m-2')
                        .click(function() {
                          $(location).prop('href', '/authorize_hospital_requests/response?' + new URLSearchParams({ id, action: 'authorize' }));
                        }),
                      $('<button/>')
                        .text('Reject')         
                        .addClass('btn btn-danger m-2')
                        .click(function() {
                          $(location).prop('href', '/authorize_hospital_requests/response?' + new URLSearchParams({ id, action: 'reject' }));
                        })    
                    )
              )
          )
      );

      $('#cards_container').prepend(
        request_ele
      );
    }
  });
}


const hospital_authorization_ws_url = location.protocol == 'https' ?
  'wss://' : 'ws://'
  + location.host + '/authorize_hospital_requests';

// connect to websocket
let cards_container = $('#cards_container').replaceWith(
  $('<div/>')
    .attr('id', 'connecting_container')
    .addClass('d-flex align-items-center justify-content-center flex-grow-1')
    .text('Connecting To Server')
);
let hospital_authorization_ws;
connect_to_websocket();