// load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config()

import ethers from 'ethers';
import { contract_abis, contract_addresses } from './contract_infos.mjs';
import { verify_blob, update_blob_timestamp, authorize_viewing_permission } from './blob.mjs';
import { get_user  } from './users.mjs';
import { add_to_user_activity, add_pending_request, close_pending_requests_by_blob_id } from './contract_activity.mjs';


export function get_accessible_patients(hospital) {
  const accessible = hospital_access.get(hospital);
  if (accessible != undefined) {
    return Array.from(accessible);
  }
  return [];
}

const blob_infos = new Map();
const hospital_access = new Map();

export function init_listeners() {

  const provider = new ethers.providers.WebSocketProvider(
    process.env.BLOCKCHAIN_PROVIDER_URL
  );

  const addition_contract = new ethers.Contract(contract_addresses.addition_contract, contract_abis.addition_contract, provider);
  addition_contract.on('RequestAddition', (patient, hospital, blob_id, blob_checksum, req_id) => {

    const default_admin = '0x0000000000000000000000000000000000000000';
    patient = patient.toLowerCase();
    hospital = hospital.toLowerCase();
    req_id = req_id.toNumber();

    blob_infos.set(blob_id, { patient, hospital });

    const hospital_HIN = get_user(hospital).hin;
    const patient_aadhaar = get_user(patient).aadhaar;

    const timestamp = Date.now();

    add_to_user_activity(hospital, { 
      event: 'Record Addition Request',
      timestamp,
      patient_aadhaar,
      blob_id,
      blob_checksum,
      req_id
    });

    add_to_user_activity(patient, { 
      event: 'Record Addition Request',
      timestamp,
      hospital_HIN,
      blob_id,
      blob_checksum,
      req_id
    });

    add_to_user_activity(default_admin, { 
      event: 'Record Addition Request',
      timestamp,
      patient_aadhaar,
      hospital_HIN,
      blob_id,
      blob_checksum,
      req_id
    });

    const hospital_name = get_user(hospital).name;
    const request = `${hospital_name} wants to add a patient record.`;
    const request_type = 'record addition';
    add_pending_request(patient, { request_type, request, hospital_HIN, blob_id, blob_checksum, timestamp, req_id });
  });

  addition_contract.on('RequestGranted', blob_id => {

    verify_blob(blob_id);
    const timestamp = Date.now();
    update_blob_timestamp(blob_id, timestamp);

    const default_admin = '0x0000000000000000000000000000000000000000';
    const { patient, hospital } = blob_infos.get(blob_id);

    add_to_user_activity(hospital, { 
      event: 'Record Addition Granted',
      timestamp,
      blob_id
    });

    add_to_user_activity(patient, { 
      event: 'Record Addition Granted',
      timestamp,
      blob_id
    });

    add_to_user_activity(default_admin, { 
      event: 'Record Addition Granted',
      timestamp,
      blob_id
    });

    close_pending_requests_by_blob_id(patient, blob_id);
  });


  const view_contract = new ethers.Contract(contract_addresses.view_contract, contract_abis.view_contract, provider);

  view_contract.on('RequestView', (patient, hospital, req_id) => {

    const default_admin = '0x0000000000000000000000000000000000000000';
    patient = patient.toLowerCase();
    hospital = hospital.toLowerCase();
    req_id = req_id.toNumber();
    
    const timestamp = Date.now();
    const hospital_HIN = get_user(hospital).hin;
    const patient_aadhaar = get_user(patient).aadhaar;

    add_to_user_activity(hospital, { 
      event: 'Data Viewing Request',
      timestamp,
      patient_aadhaar,
      req_id
    });

    add_to_user_activity(patient, { 
      event: 'Data Viewing Request',
      timestamp,
      hospital_HIN,
      req_id
    });

    add_to_user_activity(default_admin, { 
      event: 'Data Viewing Request',
      timestamp,
      patient_aadhaar,
      hospital_HIN,
      req_id
    });

    const hospital_name = get_user(hospital).name;
    const request = `${hospital_name} wants to view your data.`;
    const request_type = 'view data';
    add_pending_request(patient, { request_type, request, hospital_HIN, timestamp, req_id });
  });

  view_contract.on('RequestGranted', (patient, hospital) => {

    const default_admin = '0x0000000000000000000000000000000000000000';
    patient = patient.toLowerCase();
    hospital = hospital.toLowerCase();

    const access = hospital_access.get(hospital) ?? [];
    access.push(patient);
    hospital_access.set(hospital, access);

    const timestamp = Date.now();
    const hospital_HIN = get_user(hospital).hin;
    const patient_aadhaar = get_user(patient).aadhaar;

    add_to_user_activity(hospital, { 
      event: 'Viewing Permission Granted',
      timestamp,
      patient_aadhaar
    });

    add_to_user_activity(patient, { 
      event: 'Viewing Permission Granted',
      timestamp,
      hospital_HIN
    });

    add_to_user_activity(default_admin, { 
      event: 'Viewing Permission Granted',
      timestamp,
      hospital_HIN
    });

    authorize_viewing_permission(hospital, patient);
  });
}