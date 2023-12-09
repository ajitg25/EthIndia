const url_params = new URLSearchParams(location.search);
const id = url_params.get('id');

$('#reject_btn').click(async () => {
  $('#reject_btn').prop('disabled', true);

  const response = await fetch('/authorize_hospital_requests/response', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const { failure_reason } = await response.json();
    alert(failure_reason);
    $('#reject_btn').prop('disabled', false);
    return;
  }

  const request_description = $('#request').text()

  // change screen to track confirmations
  $('#container').html('loading..');
  $('#container').html(
    await (
      await fetch('/partials/response_confirmation')
    ).text()
  );
  $('#request_description').val(request_description);
  $('#response').val('rejected');
  $('#status').val('approved');
});