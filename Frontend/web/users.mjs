const users = new Map();

// default admin
add_user('0x0000000000000000000000000000000000000000', { authorization_status: 'authorized', user_type: 'admin', name: 'Default Admin' });

// TEMPORARY ONLY
add_user('0x5f3a14d4e21e74455945f26a34a852151a87efa8', { authorization_status: 'authorized', user_type: 'admin', name: 'Admin User' });
add_user('0xcd5ffc1a56244f9b21a72cd6cd73adba90e8b490', { authorization_status: 'authorized', user_type: 'patient', name: 'Dan Arnin', aadhaar: '567435356343' });
add_user('0x7f40f621bda647b841728ee9ab8b1f9b661745ed', { authorization_status: 'authorized', user_type: 'hospital', name: 'Assure Hospital', hin: '33faf' });
add_user('0xe2a90d7ab8a1044be7f02ba3be1f70de9f660efe', { authorization_status: 'authorized', user_type: 'hospital', name: 'Cookie Hospital', hin: '33fafafaf' });
add_user('0xd77f7429026e3a5722c02802f09dcbb1ebe321af', { authorization_status: 'authorized', user_type: 'researcher', name: 'Rickie' });

// get user information
export function get_user(wallet_address) {
  return users.get(wallet_address);
}

// get user type -> high access frequency, use RAM to store
export function get_user_type(wallet_address) {
  return get_user(wallet_address)?.user_type;
}

// get username -> high access frequency, use RAM to store
export function get_username(wallet_address) {
  return get_user(wallet_address)?.name;
}

export function add_user(wallet_address, user_details) {
  users.set(wallet_address, user_details);
}

export function change_authorization_status(wallet_address, new_authorization_status) {
  get_user(wallet_address).authorization_status = new_authorization_status;
}

export function get_patient_with_aadhaar(patient_aadhaar) {

  for (const [wallet_address, user_info] of users) {
    if (user_info.aadhaar == patient_aadhaar) {
      return wallet_address
    }
  }
  return null;
}

export function get_hospital_with_hin(hospital_hin) {

  for (const [wallet_address, user_info] of users) {
    if (user_info.hin == hospital_hin) {
      return wallet_address
    }
  }
  return null;
}

export function get_unverified_users() {

  const unverified_users = [];

  users.forEach((user_data, wallet_address) => {

    if (user_data.authorization_status == 'pending') {
      unverified_users.push({
        wallet_address,
        ...user_data
      });
    }
  });

  return unverified_users;
}