import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import path from 'path'
import fs from 'fs';
import { randomUUID } from 'crypto';

export const blob_access_set = new Map();

const blob_infos = new Map();

// get blob
export function get_blob_info(blob_uuid) {
  return blob_infos.get(blob_uuid);
}

export function blob_access(wallet_address, blob_uuid) {

  const blob_info = get_blob_info(blob_uuid);

  if (blob_info == undefined) {
    return { can_access: false, denied_access_reason: 'Blob does not exist.' };
  }

  if (blob_info.verification_status == 'unverified' && Date.now() >= blob_info.expires_at) {
    return { can_access: false, denied_access_reason: 'Blob has expired (no patient confirmation).' };
  }

  // patient and hospital always have access
  if (wallet_address == blob_info.owner || wallet_address == blob_info.patient) {
    return { can_access: true };
  }

  const access_set = blob_access_set.get(wallet_address);
  if (access_set != undefined && access_set.has(blob_uuid)) {
    return { can_access: true };
  }

  return { can_access: false, denied_access_reason: 'No permission to access Blob' };
}

export async function add_unverified_blob(_blob_info) {
  const { blob_uuid, file, file_name, owner, description } = _blob_info;

  const blob_name = randomUUID();
  const expires_at = Date.now() + 1000 * 60 * 20 // 20 min from creation

  // upload file
  fs.writeFileSync(path.join(__dirname, `blobs/${blob_name}`), fs.readFileSync(file.path))

  const blob_info = { 
    file_name,
    description,
    verification_status: 'unverified',
    owner,
    blob_name,
    expires_at
  };

  blob_infos.set(blob_uuid, blob_info);
}

export function verify_blob(blob_uuid) {
  blob_infos.get(blob_uuid).verification_status = 'verified';
}

export function update_blob_timestamp(blob_uuid, timestamp) {
  blob_infos.get(blob_uuid).timestamp = timestamp;
}

export function get_verified_blobs(wallet_address) {

  const verified_blobs = [];

  for (const [blob_uuid, blob_info] of blob_infos) {
    if (blob_info.patient == wallet_address && blob_info.verification_status == 'verified') {

      verified_blobs.push(blob_uuid);
    }
  }

  return verified_blobs;
}

export function authorize_viewing_permission(viewer, patient) {
  const accessible_blobs = blob_access_set.get(viewer) ?? new Set();

  blob_infos.forEach((blob_info, blob_uuid) => {

    if (blob_info.verification_status == 'verified' 
        && blob_info.patient == patient) {

      accessible_blobs.add(blob_uuid);
    }
  });
  blob_access_set.set(viewer, accessible_blobs);
}

export function get_blob_with_name(blob_name) {
  for (const [blob_uuid, blob_info] of blob_infos) {
    if (blob_info.blob_name == blob_name) {
      return blob_uuid;
    }
  }
}

export function get_all_verified_blobs() {
  const blobs = []
  blob_infos.forEach(blob => {
    if (blob.verification_status == 'verified') {
      blobs.push(blob);
    }
  });
  return blobs;
}