/// Private key for wallet. Set to null to generate a private key and exit.
/// If the key below starts with 'f816', it's the unsecure DEMO KEY!!
/// TODO: Switch to WIF encoding, rather than raw hex.
export const PRIVATE_KEY = "f816ae0eedd568d802070d57bf8ae2aa0f1b77b615f3828942fe2322114a65be"

/// Set to null if refill purchases are priced in BCH
export const CONVERSION_CURRENCY = 'nok';

/// Amount of CONVERSION_CURRENCY units to purchase refillment.
export const NEW_PURCHASE_THRESHOLD = 1.5; // NOK

/// Where to send coins when purchasing refillment
export const MERCHANT_DESTINATION_ADDRESS = 'bitcoincash:qzxscpfwfwmwldrsq88extjsgyfdp6zt8qz83hn7jf';

/// Where to send refillment order e-mail
export const MERCHANT_DESTINATION_EMAIL = 'merchant@example.org';

/// How often to update the fiat/BCH conversion rate (in seconds)
export const CONVERSION_UPDATE_INTERVAL = 600;

/// satoshis per BCH
export const COIN = 100000000;
