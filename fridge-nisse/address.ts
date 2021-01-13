import {
  CashAddressType, CashAddressNetworkPrefix,
  encodeCashAddress, generatePrivateKey as genprivkey,
  instantiateSecp256k1, instantiateRipemd160,
  instantiateSha256
} from '@bitauth/libauth';
const crypto = require('crypto');

export async function sha256(buffer: Uint8Array): Promise<Uint8Array> {
  const libsha256 = await instantiateSha256();
  const state1 = libsha256.init();
  const state2 = libsha256.update(state1, buffer);
  return libsha256.final(state2);
}

export async function hash160(buffer: Uint8Array): Promise<Uint8Array> {
  const sha = await sha256(buffer);
  const ripemd160 = await instantiateRipemd160();
  const state1 = ripemd160.init();
  const state2 = ripemd160.update(state1, sha);
  return ripemd160.final(state2);
}

export function generatePrivateKey() : Uint8Array {
  return genprivkey(() => crypto.randomBytes(32));
}

export async function derivePublicKey(privateKey: Uint8Array): Promise<Uint8Array> {
  const secp256k1 = await instantiateSecp256k1();
  return secp256k1.derivePublicKeyCompressed(privateKey);
}

export function hashToAddress(hash: Uint8Array, addressType: string): string {
  if (addressType !== 'p2sh' && addressType !== 'p2pkh') {
    throw new Error('Unsupported address type');
  }

  let type = CashAddressType.P2PKH;
  if (addressType === 'p2sh') {
    type = CashAddressType.P2SH;
  }
  const prefix = CashAddressNetworkPrefix.mainnet;
  return encodeCashAddress(prefix, type, hash);
}

export async function getPublicKeyHash(pubkey: Uint8Array): Promise<Uint8Array> {
  return hash160(pubkey);
}

export async function privateKeyToP2PKH(privateKey: Uint8Array) {
    const pk = await derivePublicKey(privateKey);
    const pkh = await getPublicKeyHash(pk);
    return hashToAddress(pkh, 'p2pkh');
}
