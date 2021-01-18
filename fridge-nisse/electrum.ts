import { ElectrumCluster, ElectrumTransport, RequestResponse } from 'electrum-cash';

let connectPromise: Promise<void> | null = null;
let electrum: ElectrumCluster | null = null;

/**
 * Look at https://bitcoincash.network/electrum for available API calls.
 */

export async function connect() {
  electrum = new ElectrumCluster('fridge.cash', '1.4.2', 1, 1);
  electrum.addServer('bitcoincash.network');
  // electrum.addServer('electrs.bitcoinunlimited.info');
// ElectrumTransport.WSS.Port, ElectrumTransport.WSS.Scheme,
  try {
    await electrum.ready();
  } catch (e) {
    console.log('Failed to connect ', e);
  }
}

export async function disconnect() {
  try {
    if (electrum !== null) {
      await electrum.shutdown();
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

export async function getTransaction(txid: string, verbose: boolean): Promise<RequestResponse> {
  return call('blockchain.transaction.get', txid, verbose);
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

export async function getHistory(address: string) {
    return call('blockchain.address.get_history', address);
}

export async function subscribeAddress(address: string, callback: any) {
    console.log(`Subscribing to ${address}`);
    electrum.subscribe(async () => {
        console.log("notification!");
        await callback();
    }, 'blockchain.address.subscribe', address);
}

