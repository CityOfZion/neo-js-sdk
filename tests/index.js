import chai from 'chai';
import { ab2str,
  str2ab,
  hexstring2ab,
  ab2hexstring,
  reverseArray,
  numStoreInMemory,
  stringToBytes } from '../src/utils';
import * as wallet from '../src/index';
import * as api from '../src/api';
import axios from 'axios';
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const should = chai.should();

describe('api.js', function() {
  this.timeout(5000);

  const testKeys = {
    'a': {
      address: 'ALq7AWrhAueN6mJNqk6FHJjnsEoPRytLdW',
      wif: 'L1QqQJnpBwbsPGAuutuzPTac8piqvbR1HRjrY5qHup48TBCBFe4g'
    },
    b: {
      address: "ALfnhLg7rUyL6Jr98bzzoxz5J7m64fbR4s",
      wif: "L2QTooFoDFyRFTxmtiVHt5CfsXfVnexdbENGDkkrrgTTryiLsPMG"
    },
    c: {
      address: "AVf4UGKevVrMR1j3UkPsuoYKSC4ocoAkKx",
      wif: "KyKvWLZsNwBJx5j9nurHYRwhYfdQUu9tTEDsLCUHDbYBL8cHxMiG"
    }
  }

  // TODO: this works, but will not work repeatedly for obvious reasons :)
  // it('should claim ANC', (done) =>{
  //   api.claimAllGAS(api.MAINNET, testKeys.c.wif).then((response) => {
  //     console.log(response);
  //     done();
  //   })
  // });

  it('should connect to the light wallet API and get wallet DB height', (done) => {
    api.getWalletDBHeight(api.TESTNET).then((response) => {
      response.should.be.a('number');
      done();
    }).catch((e) => {
      console.error(e)
    });
  });


  it('should generate a new private key', (done) => {
    const privateKey = ab2hexstring(wallet.generatePrivateKey());
    privateKey.should.have.length(64);
    done();
  });
  //
  it('should generate a valid WIF', (done) => {
    const privateKey = wallet.generatePrivateKey();
    const wif = wallet.getWIFFromPrivateKey(privateKey);
    const account = wallet.getAccountsFromWIFKey(wif)[0];
    account.privatekey.should.equal(ab2hexstring(privateKey));
    done();
  });

  it('should get keys from a WIF', (done) =>{
    const account = wallet.getAccountsFromWIFKey(testKeys.a.wif)[0];
    account.privatekey.should.be.a('string');
    account.address.should.equal(testKeys.a.address);
    done();
  });

  it('should verify publicKeyEncoded', (done) => {
    const privateKey = ab2hexstring(wallet.generatePrivateKey());
    const accounts = wallet.getAccountsFromPrivateKey(privateKey);
    accounts.should.not.equal(-1);
    const verify = wallet.verifyPublicKeyEncoded(accounts[0].publickeyEncoded);
    verify.should.equal(true);
    done();
  });

  it('should verify address', (done) => {
    const privateKey = ab2hexstring(wallet.generatePrivateKey());
    const accounts = wallet.getAccountsFromPrivateKey(privateKey);
    accounts.should.not.equal(-1);
    const verify = wallet.verifyAddress(accounts[0].address);
    verify.should.equal(true);
    done();
  });

  it('should get balance from address', (done) => {
    api.getBalance(api.TESTNET, testKeys.a.address).then((response) =>{
      response.Neo.should.be.a('number');
      response.Gas.should.be.a('number');
      done();
    });
  });

  it('should get unspent transactions', (done) => {
    api.getBalance(api.TESTNET, testKeys.a.address, api.neoId).then((response) => {
      response.unspent.Neo.should.be.an('array');
      response.unspent.Gas.should.be.an('array');
      done();
    })
  });

  it('should send NEO', (done) => {
    api.doSendAsset(api.TESTNET, testKeys.b.address, testKeys.a.wif, "Neo", 1).then((response) => {
      console.log('response', response)
      response.result.should.equal(true);
      // send back so we can re-run
      api.doSendAsset(api.TESTNET, testKeys.a.address, testKeys.b.wif, "Neo", 1).then((response) => {
        response.result.should.equal(true);
        done();
      });
    })
  });

  it('should send GAS', (done) => {
    api.doSendAsset(api.TESTNET, testKeys.b.address, testKeys.a.wif, "Gas", 1).then((response) => {
      response.result.should.equal(true);
      // send back so we can re-run
      api.doSendAsset(api.TESTNET, testKeys.a.address, testKeys.b.wif, "Gas", 1).then((response) => {
        response.result.should.equal(true);
        done();
      });
    })
  });
});
