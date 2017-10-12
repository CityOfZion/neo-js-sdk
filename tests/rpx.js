import Neon from '../src/index.js'
import axios from 'axios'

/**
 * 1 NEO 0 GAS   **SUCCESSFUL**
 * privateKey: fdc4deb9fa7364336d0ee3c4c7e0ecacc782993e098c6fd0cd7f334365c9cb62
 * loading: 76fc48890e182fe2b10ca1fb244e8509c78c8646ee287a6d95410bdbc7e62eca
 * minting:34636afb1fa30d3991b2ae148d01475ca0284921ca030b02b7809cb3aed65c6c
 * balance: 1000
 */

// use .only to run one test at a time

describe.skip('RPX', function () {
  this.timeout(10000)
  // Change this to your upgraded node address.
  const upgradedTestNode = 'http://localhost:20332'
  // Change this to your new address that you will be minting from.
  const privateKey = 'fdc4deb9fa7364336d0ee3c4c7e0ecacc782993e098c6fd0cd7f334365c9cb62'
  // Set amt of NEO to use to mint
  const NeoAmt = 1
  // Set systemfee to attach
  const gasCost = 0

  const acct = Neon.create.account(privateKey)
  const pkey = acct.publicKey
  const RPX = '5b7074e873973a6ed3708862f219a6fbf4d1c411'
  const invo = {
    'outputs': [
      {
        assetId: 'c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b',
        value: 1,
        scriptHash: RPX
      }
    ],
    publicKey: pkey,
    invoke: {
      scriptHash: RPX,
      operation: 'mintTokens'
    }
  }

  it('Load account', () => {
    return Neon.api.doSendAsset('TestNet', acct.address, 'L1QqQJnpBwbsPGAuutuzPTac8piqvbR1HRjrY5qHup48TBCBFe4g', { NEO: NeoAmt, GAS: gasCost })
      .then((res) => {
        res.should.have.property('result', true)
      })
      .catch((e) => {
        console.log(e)
        throw e
      })
  })

  it('mintRPX', () => {
    const endPoint = Neon.api.getAPIEndpoint('TestNet')
    const address = Neon.create.account(pkey).address
    return axios.get(endPoint + '/v2/address/balance/' + address)
      .then((res) => {
        let tx = Neon.create.invocation(pkey, res.data, invo.outputs, invo.invoke, gasCost, { version: 1 })
        const signedTx = Neon.create.signature(tx, privateKey)
        const hash = Neon.get.transactionHash(signedTx)
        console.log(`Hash: ${hash}`)
        return Neon.api.doSendTx('TestNet', signedTx)
      })
      .then((res) => {
        res.should.have.property('result', true)
      })
      .catch((e) => {
        console.log(e)
        throw e
      })
  })

  it('checkBalance', () => {
    console.log(acct.address)
    return Neon.getTokenBalance('TestNet', RPX, acct.address)
      .then((balance) => {
        console.log(`Balance: ${balance}`)
        balance.should.be.above(0)
      })
      .catch((e) => {
        console.log(e)
        throw e
      })
  })
})
