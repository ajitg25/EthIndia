import { update_user_activity_socket, update_hospital_authorization_socket} from './sockets.mjs';
import { get_user } from './users.mjs';

const user_activity = new Map();

export function add_to_user_activity(wallet_address, activity) {
  const activities = get_user_activity(wallet_address);
  activities.unshift(activity);
  user_activity.set(wallet_address, activities)
  update_user_activity_socket(wallet_address, activity);
}

export function get_user_activity(wallet_address) {
  if (get_user(wallet_address).user_type == 'admin') {
    const default_admin = '0x0000000000000000000000000000000000000000';
    return user_activity.get(default_admin) ?? [];
  }
  return user_activity.get(wallet_address) ?? [];
}

const pending_requests = new Map();

export function add_pending_request(wallet_address, request_data) {
  const pending = pending_requests.get(wallet_address) ?? [];
  pending.unshift(request_data);
  pending_requests.set(wallet_address, pending);
  update_hospital_authorization_socket(wallet_address, request_data);
}

export function get_pending_requests(wallet_address) {
  return pending_requests.get(wallet_address) ?? [];
}

export function close_pending_requests(wallet_address, index) {
  const pending = pending_requests.get(wallet_address);
  pending.splice(index, 1);
  pending_requests.set(wallet_address, pending);
}

export function close_pending_requests_by_blob_id(wallet_address, blob_uuid) {
  const pending = pending_requests.get(wallet_address);
  for (const [index, request] of pending.entries()) {
    if (request.blob_id == blob_uuid) {
      pending.splice(index, 1);
      return;
    }
  }
  pending_requests.set(wallet_address, pending);
}