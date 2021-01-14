import { ElectrumClient, ElectrumTransport, RequestResponse } from 'electrum-cash';

let connectPromise: Promise<void> | null = null;
let electrum: ElectrumClient | null = null;

/**
 * Look at https://bitcoincash.network/electrum for available API calls.
 */

export async function connect() {
  electrum = new ElectrumClient(
    'fridge.cash',
    '1.4.2', 'bitcoincash.network',
    ElectrumTransport.WSS.Port, ElectrumTransport.WSS.Scheme,
  );
  try {
    await electrum.connect();
  } catch (e) {
    console.log('Failed to connect ', e);
  }
}

export async function disconnect() {
  try {
    if (electrum !== null) {
      await electrum.disconnect();
      electrum = null;
    }
  } catch (e) {
    console.error('Disconnect error', e);
  }
};

async function call(method: string, ...args: any[]): Promise<RequestResponse> {
  if (electrum === null) {
    throw Error('Not connected to an electrum server');
  }
    const response = await electrum.request(method, ...args);
    if (response instanceof Error) {
        throw response;
    }
    return response;
}

export async function getTransaction(txid: string): Promise<RequestResponse> {
  return call('blockchain.transaction.get', txid, true);
}

export async function getBalance(address: string) {
    return call('blockchain.address.get_balance', address);
}

export async function getUtxos(address: string) {
    return call('blockchain.address.listunspent', address);
}

export async function broadcast(tx: string) {
    return call('blockchain.transaction.broadcast', tx);
}

export async function dummyFunc(): Promise<void> {
  /* to make 'prefer default export' go away */
}
