import { ethers } from "/node_modules/ethers/ethers.esm.js";

$('#submit_btn').prop('disabled', true);
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
  $('#submit_btn').prop('disabled', false);
}).catch((err) => {
  alert(err);
});

$('#submit_btn').click(async () => {
  $('#submit_btn').prop('disabled', true);

  const { wallet_address } = await (await fetch('/wallet_address')).json()
  const signer_address = (await signer.getAddress()).toLowerCase();
  if (wallet_address != signer_address) {
    alert(`Please log into ${signer_address} in your wallet`);
    $('#submit_btn').prop('disabled', false);
    return;
  }

  const patient_aadhaar = $('#patient_aadhaar').val();
  const response = await fetch('/get_patient?' + new URLSearchParams({ patient_aadhaar }));

  if (!response.ok) {
    const { error_reason } = await response.json();
    alert(error_reason);
    $('#submit_btn').prop('disabled', false);
    return;
  }
  const patient_wallet_address = (await response.json()).wallet_address;

  const transaction_response = 
  await (async () => {

    try {
      const response = 
      await view_contract.Request(
       patient_wallet_address
      );
     return response;

    } catch(err) {
      alert(err);
    return null;
    }
  })();
  if (transaction_response == null) {
    $('#submit_btn').prop('disabled', false);
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