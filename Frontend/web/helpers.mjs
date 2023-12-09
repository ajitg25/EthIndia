import crypto from 'crypto'

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import path from 'path'
import fs from 'fs';

// verify if 'name' is an env var
export function verify_env_defined(name) {
  if (process.env[name] == undefined) {
    console.error(`Environment Variable [${name}] is required to be defined.`);
    process.exit(1);
  }
}

export function random_uint32() {
  return crypto.randomBytes(4).readUInt32BE(0, true);
}

export function random_16bytes_hex() {
  return '0x' + crypto.randomBytes(16).toString('hex');
}

export function create_directory_if_not_exist(_path) {
  const dir_path = path.join(__dirname, _path);

  if (!fs.existsSync(dir_path)){
    fs.mkdirSync(dir_path, { recursive: true });
  }
}

export function calculate_checksum(str, algorithm, encoding) {
  return '0x' + crypto
    .createHash(algorithm || 'md5')
    .update(str, 'utf8')
    .digest(encoding || 'hex')
}