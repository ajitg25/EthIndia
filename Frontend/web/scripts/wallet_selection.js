$('#external_wallet_btn').click(() => {
  $(location).prop('href', '/connect/external_wallet');
});

$('#no_wallet_btn').click(() => {
  $(location).prop('href', '/connect/no_wallet');
});