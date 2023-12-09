import jwt from 'jsonwebtoken';

import { get_user_type } from './users.mjs';


// wallet -> { nonce, expiration }
export const nonces = new Map();

// get user from token
export function wallet_address_from_token(token) {
  if (token == undefined) {
    return null;
  }
  try {
    const data = jwt.verify(token, process.env.TOKEN_SECRET);
    return data.wallet_address;
  }
  catch (err) {
    console.log(err);
    return null;
  }
}

// authorize middleware 
export function authorize(req, res, next) {
  const wallet_address = wallet_address_from_token(req.cookies.access_token);
  if (wallet_address) {
    req.wallet_address = wallet_address;
    next();
  }
  else {
    const HTTP_UNAUTHORIZED = 401;
    res.status(HTTP_UNAUTHORIZED).end();
  }
}

// route accessible only to patients 
export function patient_route(req, res, next) {

  authorize(req, res, () => {
    if (get_user_type(req.wallet_address) != 'patient') {
      const HTTP_UNAUTHORIZED = 401;
      res.status(HTTP_UNAUTHORIZED).end();
    }
    else {
      next();
    }
  });
}

// route accessible only to hospitals 
export function hospital_route(req, res, next) {

  authorize(req, res, () => {
    if (get_user_type(req.wallet_address) != 'hospital') {
      const HTTP_UNAUTHORIZED = 401;
      res.status(HTTP_UNAUTHORIZED).end();
    }
    else {
      next();
    }
  });
}

// route accessible only to admins 
export function admin_route(req, res, next) {

  authorize(req, res, () => {
    if (get_user_type(req.wallet_address) != 'admin') {
      const HTTP_UNAUTHORIZED = 401;
      res.status(HTTP_UNAUTHORIZED).end();
    }
    else {
      next();
    }
  });
}

export function researcher_route(req, res, next) {

  authorize(req, res, () => {
    if (get_user_type(req.wallet_address) != 'researcher') {
      const HTTP_UNAUTHORIZED = 401;
      res.status(HTTP_UNAUTHORIZED).end();
    }
    else {
      next();
    }
  });
}