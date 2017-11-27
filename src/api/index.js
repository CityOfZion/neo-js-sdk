import * as neonDB from './neonDB'
import * as cmc from './coinmarketcap'
import * as nep5 from './nep5'
import * as neoscan from './neoscan'

/**
 * @typedef {object} History
 * @property {string} address - Address.
 * @property {string} name - API name.
 * @property {string} net - 'MainNet' or 'TestNet'
 * @property {PastTx[]} history - List of past transactions.
 */

/**
 * @typedef {object} PastTx
 * @property {number} GAS - Gas involved.
 * @property {number} NEO - NEO involved.
 * @property {number} block_index - Block index.
 * @property {boolean} gas_sent - Was GAS sent.
 * @property {boolean} neo_sent - Was NEO sent.
 * @property {string} txid - Transaction ID.
 */

export default {
  get: {
    price: cmc.getPrice,
    balance: neonDB.getBalance,
    claims: neonDB.getClaims,
    transactionHistory: neonDB.getTransactionHistory,
    tokenBalance: nep5.getTokenBalance,
    tokenInfo: nep5.getTokenInfo
  },
  do: {
    sendAsset: neonDB.doSendAsset,
    claimAllGas: neonDB.doClaimAllGas,
    mintTokens: neonDB.doMintTokens
  }
}

export * from './core'
export { neonDB, cmc, nep5, neoscan }
