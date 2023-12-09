$('#authorize_btn').click(async () => {

  $('#authorize_btn').prop('disabled', true);

  const wallet_address = (await ethereum.request({ method: 'eth_accounts' }))[0];
  const nonce_response = await fetch('/nonce?' + new URLSearchParams({ wallet_address }));
  const { nonce } = await nonce_response.json();

  const msg_params = [
    {
      type: 'string',
      name: 'Message',
      value: 'Signing This Message Will Allow G-KnowMe To Verify Your Identity',
    },
    {
      type: 'uint32',
      name: 'Nonce',
      value: nonce,
    },
  ];

  let signature; 

  try {
    signature = await ethereum.request({
      method: 'eth_signTypedData',
      params: [msg_params, wallet_address],
    });
  }
  catch(err) {
    alert(`Authentication Failed: (${ err.message })`);
    $('#authorize_btn').prop('disabled', false);
    return;
  }

  const auth_response = await fetch('/authorize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ wallet_address, signature }),
  })

  if (auth_response.ok) {
    $(location).prop('href', '/');
  }
  else {
    const { failure_reason } = await auth_response.json();
    alert(`Authentication Failed: (${ failure_reason })`);
  }
});