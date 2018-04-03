---
id: basic_invoke
title: Basic - Invoking a Smart Contract
---

In this tutorial you will learn the difference between a testinvoke - as used in the Create Smart Contract Script guide - and an actual invocation of a Smart Contract. You will learn to use the `doInvoke` function to persist your calls to the NEO Blockchain.

This guide will continue on the previous guide, using the old [ICO Template](https://github.com/neo-project/examples-csharp/blob/master/ICO_Template/ICO_Template.cs).

## testinvoke vs invocationTransaction
In the previous guide, we used `Neon.rpc.Query.invokeScript` as an RPC call to invoke our script. What we've actually done is use the equivalent of neo-python's `testinvoke`, to literally test whether our invocation was successful.

Unless we turn this into an `invocationTransaction` RPC call, this will not persist to the blockchain. To do this, the script will be turned into a transaction. This, in turn, has to be signed with the user's private key.

## doInvoke
Luckily, `doInvoke` handles this for us! It will configure our script as a transaction, sign it with our private key and ultimately send it via an `invocationTransaction` RPC call.

To use the `doInvoke` function, we need the following minimal ingredients:
* `net`: 'MainNet', 'TestNet' or an API (like neoscan or neon-wallet-db)
* `script`: the Smart Contract script. You can use a VM script - created with `Neon.create.script` - or a ScriptParams object that looks like:

```js
{
  scriptHash: '5b7074e873973a6ed3708862f219a6fbf4d1c411',
  operation: 'balanceOf',
  args: [Neon.u.reverseHex('cef0c0fdcfe7838eff6ff104f9cdec2922297537')]
}
```

* `account`: an `Account` object that has an address and private key stored. Alternatively, you can use `address` and `privateKey` directly to pass these values.
* `gas`: the gas fee we will attach to the transaction (this has to be an integer!)

This in turn will be stored in a configuration object

```js
const config = {
  net: "http://localhost:5000",
  script: Neon.create.script({
    scriptHash: '5b7074e873973a6ed3708862f219a6fbf4d1c411',
    operation: 'balanceOf',
    args: [Neon.u.reverseHex('cef0c0fdcfe7838eff6ff104f9cdec2922297537')]
  }),
  address: account.address,
  privateKey: account.privateKey,
  gas: 1
}
```

and ultimately we call doInvoke as a promise

```js
Neon.doInvoke(config).then(res => {
  console.log(res)
})
```

In the console result, you will find:

* the data of your config object
* the balance of your account (which is queried from either neoscan or neon-wallet-db)
* the signed transaction
* the response from the JSON RPC
* the url of the NEO node it communicated with

A high-level example of a response:

```js
{
  "address": /* the user's address */,
  "balance": {
    /* an overview of your balance */
  },
  "gas": 1,
  "net": "http://localhost:5000",
  "privateKey": /* the user's private key */,
  "response": {
    "id": 1234,
    "jsonrpc": "2.0",
    "result": true,
    "txid": "763d2d61703f59f014d05052e14c856175b464c59b18a80fa68cd40c71d5d369"
  },
  "script": /* the script generated from Neon.create.script */,
  "tx": {
    /* a copy of the transaction doInvoke sent */
  },
  "url": /* the url of the NEO node the transaction was sent to */
}
```

## Circumventing asset-less transactions

In our example above, we sent 1 GAS alongside our invocation as a fee. As described [here](http://docs.neo.org/en-us/sc/systemfees.html#smart-contract-fees), transactions with a cost under 10 GAS are essentially free.

So our `gas` field should stay 0 if your calculated fee remains below 10 GAS. You can determine this cost with an `invokeScript` RPC as we did [here](basic_createscript.html), evaluating the `gas_consumed` field in the response object.

Without the fee, we may end up with a transaction that involves zero assets. Unfortunately for us, the NEO nodes will reject any transaction with zero assets attached.

The workaround is to attach assets and send it back to your own address.The smallest available asset is 0.00000001 GAS. This will allow us to successfully register the blockchain without wasting any assets.

```js
import Neon, { CONST } from '@cityofzion/neon-js';

const intents = [
  {
    assetId: CONST.ASSET_ID.GAS,
    value: 0.00000001,
    scriptHash: Neon.get.scriptHashFromAddress(account.address)
  }
];

// Add to config
config.intents = intents;

Neon.doInvoke(config).then(res => {
  console.log(res);
});
```
