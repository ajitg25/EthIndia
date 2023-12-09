import { ethers } from "/node_modules/ethers/ethers.esm.js";

$('#submit_btn').prop('disabled', true);
let addition_contract, signer;
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

  const { contract_address } = await (await fetch('/contract_address?' + new URLSearchParams({ contract: 'addition_contract' }))).json();
  const { contract_abi } = await (await fetch('/contract_abi?' + new URLSearchParams({ contract: 'addition_contract' }))).json();

  const contract = new ethers.Contract(contract_address, contract_abi, signer);
  return contract;

})().then(contract => {
  addition_contract = contract;
  $('#submit_btn').prop('disabled', false);
}).catch((err) => {
  alert(err);
});

const url_params = new URLSearchParams(location.search);
const blob_uuid = url_params.get('blob_uuid');


$('#submit_btn').click(async () => {
  $('#submit_btn').prop('disabled', true);

  if ($('#description').val().length == 0) {
    alert('Please Specify Record Type');
    $('#submit_btn').prop('disabled', false);
    return;
  }

  const record_details = { blob_uuid };
  $('.user_data:visible').each(function() {
    const ele = $(this);
    record_details[ele.attr('id')] = ele.val();
  })

  const response = await fetch('/new_patient_record_details', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record_details),
  });

  if (!response.ok) {
    const { failure_reason } = await response.json();
    alert(failure_reason);
    $('#submit_btn').prop('disabled', false);
    return;
  }

  const { wallet_address } = await (await fetch('/wallet_address')).json()
  const signer_address = (await signer.getAddress()).toLowerCase();
  if (wallet_address != signer_address) {
    alert(`Please log into ${signer_address} in your wallet`);
    $('#submit_btn').prop('disabled', false);
    return;
  }

  const patient_aadhaar = $('#patient_aadhaar').val();

  const patient_wallet_address =
  await (async () => {
    const response = await fetch('/get_patient?' + new URLSearchParams({ patient_aadhaar }));
  
    if (!response.ok) {
      const { error_reason } = await response.json();
      alert(error_reason);
      return null;
    }

    return (await response.json()).wallet_address;
  })();
  if (patient_wallet_address == null) {
    $('#submit_btn').prop('disabled', false);
    return;
  }

  const checksum =
  await (async () => {
    const response = await fetch('/get_checksum?' + new URLSearchParams({ blob_uuid }));
  
    if (!response.ok) {
      const { error_reason } = await response.json();
      alert(error_reason);
      return null;
    }

    return (await response.json()).checksum;
  })();
  if (checksum == null) {
    $('#submit_btn').prop('disabled', false);
    return;
  }

  const transaction_response = 
  await (async () => {

    try {
      const response = 
      await addition_contract.Request(
       patient_wallet_address,
       blob_uuid,
       checksum
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