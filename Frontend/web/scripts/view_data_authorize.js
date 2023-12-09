import { ethers } from "/node_modules/ethers/ethers.esm.js";

$('#authorize_btn').prop('disabled', true);
let view_contract, signer;
(async () => {

  signer =
  await (() => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      return provider.getSigner();

    } catch(err) {
      alert('Not Connected To Wallet! Logging Out..');
      $(location).prop('href', '/logout'); 
    }
  })();

  const { contract_address } = await (await fetch('/contract_address?' + new URLSearchParams({ contract: 'view_contract' }))).json();
  const { contract_abi } = await (await fetch('/contract_abi?' + new URLSearchParams({ contract: 'view_contract' }))).json();

  const contract = new ethers.Contract(contract_address, contract_abi, signer);
  return contract;

})().then(contract => {
  view_contract = contract;
  $('#authorize_btn').prop('disabled', false);
}).catch((err) => {
  alert(err);
});


$('#authorize_btn').click(async () => {
  $('#authorize_btn').prop('disabled', true);

  const { wallet_address } = await (await fetch('/wallet_address')).json()
  const signer_address = (await signer.getAddress()).toLowerCase();
  if (wallet_address != signer_address) {
    alert(`Please log into ${signer_address} in your wallet`);
    $('#authorize_btn').prop('disabled', false);
    return;
  }

  const req_id = parseInt($('#req_id').text());

  const transaction_response = 
  await (async () => {

    try {
      const response = 
      await view_contract.grantRequest(
        req_id
      );
     return response;

    } catch(err) {
      alert(err);
    return null;
    }
  })();
  if (transaction_response == null) {
    $('#authorize_btn').prop('disabled', false);
    return;
  }
  

  // change screen to track confirmations
  $('#container').html('loading..');
  $('#container').html(
    await (
      await fetch('/partials/confirmation_tracking')
    ).text()
  );
  $('#transaction_hash').val(transaction_response.hash);

  for (let i = 0 ;; i++) {
    $('#no_confirmations').val(i);
    await transaction_response.wait(i+1);
  }
});