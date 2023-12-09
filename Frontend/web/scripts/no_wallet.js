$('#login_btn').click(async () => {
  $('#login_btn').prop('disabled', true);

  const username = $('#username').val();
  const password = $('#password').val();

  const response = 
  await fetch(
    '/connect/no_wallet',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    }
  );

  if (response.ok) {
    $(location).prop('href', '/');
    return;
  }
  const { failure_reason } = await response.json();
  alert(failure_reason);
  $('#login_btn').prop('disabled', false);
});