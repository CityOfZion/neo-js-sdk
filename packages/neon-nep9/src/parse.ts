import { rpc, tx, wallet, sc, u, CONST } from "@cityofzion/neon-core";
import { extractAmount, extractAsset, extractAttributes } from "./extract";

/**
 * Intent as expressed by an NEP9 URI string
 */
export interface NEP9Intent {
  address: string;
  attributes: tx.TransactionAttribute[];
  asset?: string;
  amount?: number;
}

interface UTXO {
  n: number;
  txid: string;
  value: number;
}

function validateScheme(scheme: string): void {
  if (scheme !== "neo") {
    throw new Error("URI provided did not start with neo");
  }
}

function validatePath(path: string): void {
  if (!path || !wallet.isAddress(path)) {
    throw new Error(`Invalid NEO address provided: ${path}`);
  }
}

function reduceParamsToDict(params: string): { [k: string]: string } {
  const keyvalues = params ? params.split("&") : [];
  const baseDict: { [k: string]: string } = {};
  return keyvalues.reduce((obj, keyValuePair) => {
    const [key, val] = keyValuePair.split("=", 2);
    obj[key] = val;
    return obj;
  }, baseDict);
}

/**
 * Parses an NEP9 URI string into a consumable intent object. This function does not check for runtime validity conditions (eg address or contract validity).
 * @param uri Case sensitive URI string.
 */
export function parse(uri: string): NEP9Intent {
  const [scheme, uriBody] = uri.split(":", 2);
  validateScheme(scheme);
  if (!uriBody) {
    throw new Error("URI did not contain anything after neo:");
  }

  const [path, queryParams] = uriBody.split("?", 2);
  validatePath(path);

  const params = reduceParamsToDict(queryParams);

  return {
    address: path,
    asset: extractAsset(params),
    amount: extractAmount(params),
    attributes: extractAttributes(params)
  };
}

function utxoParser(getUnspentsResult: any): wallet.Balance {
  const bal = new wallet.Balance({
    address: getUnspentsResult.address
  });

  for (const assetBalance of getUnspentsResult.balance) {
    if (assetBalance.amount === 0) {
      continue;
    }
    if (assetBalance.unspent.length > 0) {
      bal.addAsset(assetBalance.asset_symbol, {
        unspent: assetBalance.unspent.map(
          (utxo: UTXO) =>
            new wallet.Coin({
              index: utxo.n,
              txid: utxo.txid,
              value: utxo.value
            })
        )
      });
    } else {
      bal.addToken(assetBalance.asset_symbol, assetBalance.amount);
    }
  }
  return bal;
}

export async function execute(
  nep9Intent: NEP9Intent,
  account: wallet.Account,
  url: string
): Promise<any> {
  const { address, asset, amount, attributes } = nep9Intent;
  if (!asset || !amount) {
    throw new Error("URI doesn't contain a contact transaction");
  }

  let transaction: tx.Transaction;
  if (asset.length === 64) {
    const balance: wallet.Balance = await rpc.Query.getUnspents(account.address)
      .parseWith(utxoParser)
      .execute(url);
    transaction = new tx.ContractTransaction();
    transaction
      .addIntent(CONST.ASSETS[asset], amount, address)
      .calculate(balance)
      .sign(account.privateKey);
    attributes.map(attr => {
      transaction.addAttribute(attr.usage, attr.data);
    });
    return rpc.Query.sendRawTransaction(transaction).execute(url);
  } else if (asset.length === 40) {
    const from = sc.ContractParam.byteArray(account.address, "address");
    const to = sc.ContractParam.byteArray(address, "address");
    const scriptIntent = {
      scriptHash: asset,
      operation: "transfer",
      args: [from, to, amount]
    };
    const script = sc.createScript(scriptIntent);
    transaction = new tx.InvocationTransaction({
      script,
      gas: 0
    });
    transaction
      .addAttribute(
        tx.TxAttrUsage.Script,
        u.reverseHex(wallet.getScriptHashFromAddress(account.address))
      )
      .addRemark(
        Date.now().toString() + u.ab2hexstring(u.generateRandomArray(4))
      ) //to avoid hash collision
      .sign(account.privateKey);
    return rpc.Query.sendRawTransaction(transaction).execute(url);
  } else {
    throw new Error("Address length is not right.");
  }
}
