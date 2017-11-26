import Wallet from '../../src/wallet/Wallet'
import Account from '../../src/wallet/Account'
import testWallet from './testWallet.json'

describe('Wallet file', function () {
  describe('Constructor', function () {
    it('default', () => {
      const w = new Wallet()
      w.should.not.equal(undefined)
      w.name.should.equal('myWallet')
    })

    it('custom config', () => {
      const config = {
        name: 'new wallet',
        scrypt: {
          n: 256,
          r: 1,
          p: 1
        }
      }
      const w = new Wallet(config)
      w.name.should.equal(config.name)
      w.scrypt.should.eql(config.scrypt)
      w.accounts.should.eql([])
    })
  })

  it('import', () => {
    const testWalletString = JSON.stringify(testWallet)
    const w = Wallet.import(testWalletString)
    w.name.should.equal('MyWallet')
    w.scrypt.should.eql(testWallet.scrypt)
    for (let i = 0; i < w.accounts.length; i++) {
      w.accounts[i].export().should.eql(testWallet.accounts[i])
    }
  })

  it('export', () => {
    const w = new Wallet(testWallet)
    const exportString = w.export()
    const imported = Wallet.import(exportString)
    w.should.eql(imported)
  })

  describe('addAccount', function () {
    it('Account', () => {
      const w = new Wallet()
      w.addAccount(new Account())
    })
  })

  it('deletes an account')

  it('')
})