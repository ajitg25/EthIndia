$('#back_btn').click(() => {
  window.history.back();
});

function connect_to_websocket() {
  user_activity_ws = new WebSocket(user_activity_ws_url);

  user_activity_ws.addEventListener('open', () => {
    $('#connecting_container').replaceWith(cards_container);
  });
  
  user_activity_ws.addEventListener('error', (event) => {
    console.log('WebSocket error: ', event);
  });
  
  user_activity_ws.addEventListener('close', (event) => {
    cards_container.empty();
    $('#cards_container').replaceWith(
      $('<div/>')
        .attr('id', 'connecting_container')
        .addClass('d-flex align-items-center justify-content-center flex-grow-1')
        .text('Connecting To Server')
    );
    setTimeout(connect_to_websocket, 1000);
  });
  
  user_activity_ws.addEventListener('message', (event) => {
    const { type, data } = JSON.parse(event.data);
  
    if (type == 'activity') {
      const { blob_uuid, ...user_data } = data;
  
      const activity_ele = (
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
              )
          )
      );

      $('#cards_container').prepend(
        activity_ele
      );
    }
  });
}


const user_activity_ws_url = location.protocol == 'https' ?
  'wss://' : 'ws://'
  + location.host + '/activity';

// connect to websocket
let cards_container = $('#cards_container').replaceWith(
  $('<div/>')
    .attr('id', 'connecting_container')
    .addClass('d-flex align-items-center justify-content-center flex-grow-1')
    .text('Connecting To Server')
);
let user_activity_ws;
connect_to_websocket();