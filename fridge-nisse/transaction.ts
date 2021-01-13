export function createTransaction(
    amount: number,
    destination: string,
    utxos: any[],
    utxosPrivateKey: Uint8Array)
{
	// libauth looks like it could take a couple of days to figure out...
	// maybe use bitcore for this??

	// https://github.com/bitpay/bitcore/blob/master/packages/bitcore-lib/docs/examples.md#create-a-transaction
	throw Error("TODO: Create merchant transaction");
};

