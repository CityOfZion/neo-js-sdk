import Query from '../../../src/rpc/query'
import ContractParam from '../../../src/sc/ContractParam'
import { DEFAULT_RPC, ASSET_ID, CONTRACTS } from '../../../src/consts'
import testKeys from '../testKeys.json'
import mockData from './mockData.json'

describe('Query', function () {
  let mock

  before(() => {
    mock = setupMock(mockData.query)
  })

  after(() => {
    mock.restore()
  })

  it('Constructor', () => {
    const q1 = new Query({ method: 'getThis' })
    q1.req.should.eql({ jsonrpc: '2.0', method: 'getThis', params: [], id: 1234 })
    const q2 = new Query({ method: 'getThat', params: [1], id: 3456 })
    q2.req.should.eql({ jsonrpc: '2.0', method: 'getThat', params: [1], id: 3456 })
  })

  describe('Methods', function () {
    it('error when executed twice', () => {
      const q = new Query({ method: 'getbestblockhash' })
      return q.execute(DEFAULT_RPC.TEST)
        .then((res) => {
          return q.execute(DEFAULT_RPC.TEST)
        })
        .should.eventually.be.rejected
    })

    it('parseWith', () => {
      const q = new Query({ method: 'parsertest' }).parseWith((i) => i.result.toUpperCase())
      return q.execute(DEFAULT_RPC.TEST)
        .then((res) => {
          q.parse.should.be.a('function')
          res.should.equal('LOWERCASE')
        })
    })
  })

  describe('RPC Queries', function () {
    it('getAccountState', () => {
      return Query.getAccountState(testKeys.a.address)
        .execute(DEFAULT_RPC.TEST)
        .then((res) => {
          res.result.should.have.all.keys([
            'version',
            'script_hash',
            'frozen',
            'votes',
            'balances'
          ])
        })
    })

    it('getAssetState', () => {
      return Query.getAssetState(ASSET_ID.NEO)
        .execute(DEFAULT_RPC.TEST)
        .then((res) => {
          res.result.should.have.all.keys([
            'version',
            'id',
            'type',
            'name',
            'amount',
            'available',
            'precision',
            'owner',
            'admin',
            'issuer',
            'expiration',
            'frozen'
          ])
        })
    })

    describe('getBlock', function () {
      it('by index', () => {
        return Query.getBlock(1)
          .execute(DEFAULT_RPC.TEST)
          .then((res) => {
            res.result.should.have.all.keys([
              'hash',
              'size',
              'version',
              'previousblockhash',
              'merkleroot',
              'time',
              'index',
              'nonce',
              'nextconsensus',
              'script',
              'tx',
              'confirmations',
              'nextblockhash'
            ])
          })
      })

      it('by hash', () => {
        return Query.getBlock('0012f8566567a9d7ddf25acb5cf98286c9703297de675d01ba73fbfe6bcb841c')
          .execute(DEFAULT_RPC.TEST)
          .then((res) => {
            res.result.should.have.all.keys([
              'hash',
              'size',
              'version',
              'previousblockhash',
              'merkleroot',
              'time',
              'index',
              'nonce',
              'nextconsensus',
              'script',
              'tx',
              'confirmations',
              'nextblockhash'
            ])
          })
      })

      it('by index without verbose', () => {
        return Query.getBlock(1, 0)
          .execute(DEFAULT_RPC.TEST)
          .then((res) => {
            res.result.should.be.a('string')
          })
      })
    })

    it('getBestBlockHash', () => {
      return Query.getBestBlockHash()
        .execute(DEFAULT_RPC.TEST)
        .then((res) => {
          res.result.should.be.a('string')
        })
    })

    it('getBlockCount', () => {
      return Query.getBlockCount()
        .execute(DEFAULT_RPC.TEST)
        .then((res) => {
          res.result.should.be.a('number')
        })
    })

    it('getBlockSysFee', () => {
      return Query.getBlockSysFee(1)
        .execute(DEFAULT_RPC.TEST)
        .then((res) => {
          res.result.should.be.a('string')
        })
    })

    it('getConnectionCount', () => {
      return Query.getConnectionCount()
        .execute(DEFAULT_RPC.TEST)
        .then((res) => {
          res.result.should.be.a('number')
        })
    })

    it('getContractState', () => {
      return Query.getContractState(CONTRACTS.TEST_RPX)
        .execute(DEFAULT_RPC.TEST)
        .then((res) => {
          res.result.should.have.any.keys([
            'version',
            'hash',
            'script'
          ])
        })
    })

    it('getPeers', () => {
      return Query.getPeers()
        .execute(DEFAULT_RPC.TEST)
        .then((res) => {
          res.result.should.have.all.keys([
            'unconnected',
            'connected',
            'bad'
          ])
        })
    })

    it('getRawMemPool', () => {
      return Query.getRawMemPool()
        .execute(DEFAULT_RPC.TEST)
        .then((res) => {
          res.result.should.be.a('array')
        })
    })

    describe('getRawTransaction', function () {
      it('verbose', () => {
        return Query.getRawTransaction('7772761db659270d8859a9d5084ec69d49669bba574881eb4c67d7035792d1d3')
          .execute(DEFAULT_RPC.TEST)
          .then((res) => {
            res.result.should.have.all.keys([
              'txid',
              'size',
              'type',
              'version',
              'attributes',
              'vin',
              'vout',
              'sys_fee',
              'net_fee',
              'scripts',
              'blockhash',
              'confirmations',
              'blocktime'
            ])
          })
      })

      it('non-verbose', () => {
        return Query.getRawTransaction('7772761db659270d8859a9d5084ec69d49669bba574881eb4c67d7035792d1d3', 0)
          .execute(DEFAULT_RPC.TEST)
          .then((res) => {
            res.result.should.be.a('string')
          })
      })
    })

    it('getStorage', () => {
      // RPX Test contract stores data by reversed scripthash
      return Query.getStorage(CONTRACTS.TEST_RPX, '9847e26135152874355e324afd5cc99f002acb33')
        .execute(DEFAULT_RPC.TEST)
        .then((res) => {
          // Data format is a Fixed8 string
          res.result.should.be.a('string')
        })
    })

    it('getTxOut', () => {
      return Query.getTxOut('7772761db659270d8859a9d5084ec69d49669bba574881eb4c67d7035792d1d3', 0)
        .execute(DEFAULT_RPC.TEST)
        .then((res) => {
          res.result.should.have.all.keys([
            'n',
            'asset',
            'value',
            'address'
          ])
        })
    })

    it('getVersion', () => {
      return true
      // Currently not implemented
      // Query.getVersion()
      //   .execute(DEFAULT_RPC.TEST)
      //   .then((res) => {

      //   })
    })

    describe('invoke', () => {
      it('simple', () => {
        return Query.invoke(CONTRACTS.TEST_RPX, ContractParam.string('name'), ContractParam.boolean(false))
          .execute(DEFAULT_RPC.TEST)
          .then((res) => {
            res.result.should.have.all.keys(['state', 'gas_consumed', 'stack'])
            res.result.state.should.equal('HALT, BREAK')
            res.result.stack[0].value.should.equal('5265642050756c736520546f6b656e20332e312e34')
          })
      })

      it('complex', () => {
        return Query.invoke(CONTRACTS.TEST_RPX, ContractParam.string('balanceOf'), ContractParam.array(ContractParam.byteArray('AVf4UGKevVrMR1j3UkPsuoYKSC4ocoAkKx', 'address')))
          .execute(DEFAULT_RPC.TEST)
          .then((res) => {
            res.result.should.have.all.keys(['state', 'gas_consumed', 'stack'])
            res.result.state.should.equal('HALT, BREAK')
          })
      })
    })

    it('invokeFunction', () => {
      return Query.invokeFunction(CONTRACTS.TEST_RPX, 'name')
        .execute(DEFAULT_RPC.TEST)
        .then((res) => {
          res.result.should.have.all.keys(['state', 'gas_consumed', 'stack'])
          res.result.state.should.equal('HALT, BREAK')
          res.result.stack[0].value.should.equal('5265642050756c736520546f6b656e20332e312e34')
        })
    })

    it('invokeScript', () => {
      return Query.invokeScript('00c1046e616d656711c4d1f4fba619f2628870d36e3a9773e874705b')
        .execute(DEFAULT_RPC.TEST)
        .then((res) => {
          res.result.should.have.all.keys(['state', 'gas_consumed', 'stack'])
          res.result.state.should.equal('HALT, BREAK')
          res.result.stack[0].value.should.equal('5265642050756c736520546f6b656e20332e312e34')
        })
    })

    it('sendRawTransaction')
    it('submitBlock')
    describe('validateAddress', function () {
      it('returns true for valid address', () => {
        return Query.validateAddress(testKeys.a.address)
          .execute(DEFAULT_RPC.TEST)
          .then((res) => {
            res.result.isvalid.should.equal(true)
          })
      })

      it('returns false for invalid address', () => {
        return Query.validateAddress('abcdefg')
          .execute(DEFAULT_RPC.TEST)
          .then((res) => {
            res.result.isvalid.should.equal(false)
          })
      })
    })
  })
})
