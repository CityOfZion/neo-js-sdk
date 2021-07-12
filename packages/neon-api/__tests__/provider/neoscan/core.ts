import { rpc, settings, u, wallet } from "@cityofzion/neon-core";
import axios from "axios";
import * as common from "../../../src/provider/common";
import * as neoscan from "../../../src/provider/neoscan/core";
import { default as internal } from "../../../src/settings";
jest.mock("axios");
jest.mock("../../../src/provider/common");

const testUrl = "http://testurl.com";
beforeEach(() => {
  jest.resetModules();
  settings.networks.UnitTestNet = new rpc.Network({
    name: "UnitTestNet",
    extra: { neonDB: testUrl, neoscan: "http://wrongurl.com" },
  });
});

describe("getRPCEndpoint", () => {
  test("returns good RPC endpoint", async () => {
    const allNodes = [
      { height: 5, url: "http://url1" },
      { height: 5, url: "http://url2" },
      { height: 1, url: "http://url3" },
    ];
    const goodNodes = [allNodes[0], allNodes[1]];
    const getCall = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        data: allNodes,
      })
    );
    axios.get = getCall;
    common.findGoodNodesFromHeight.mockImplementationOnce(() => goodNodes);
    common.getBestUrl.mockImplementationOnce(() =>
      Promise.resolve("http://url2")
    );

    const result = await neoscan.getRPCEndpoint(testUrl);

    expect(getCall).toHaveBeenCalledTimes(1);
    expect(common.findGoodNodesFromHeight).toBeCalledWith(allNodes);
    expect(common.getBestUrl).toBeCalledWith(goodNodes);
    expect(common.filterHttpsOnly).not.toBeCalled();
    expect(result).toBe("http://url2");
  });

  test("Calls filterHttpsOnly when httpsOnly setting is true", async () => {
    const allNodes = [
      { height: 5, url: "http://url1" },
      { height: 5, url: "https://url2" },
      { height: 1, url: "https://url3" },
    ];
    const filteredNodes = [allNodes[1], allNodes[2]];
    const goodNodes = [allNodes[1]];
    const getCall = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        data: allNodes,
      })
    );
    axios.get = getCall;
    common.filterHttpsOnly.mockImplementationOnce(() => filteredNodes);
    common.findGoodNodesFromHeight.mockImplementationOnce(() => goodNodes);
    common.getBestUrl.mockImplementationOnce(() =>
      Promise.resolve("https://url2")
    );
    internal.httpsOnly = true;

    const result = await neoscan.getRPCEndpoint(testUrl);

    expect(getCall).toHaveBeenCalledTimes(1);
    expect(common.filterHttpsOnly).toBeCalledWith(allNodes);
    expect(common.findGoodNodesFromHeight).toBeCalledWith(filteredNodes);
    expect(common.getBestUrl).toBeCalledWith(goodNodes);
    expect(result).toBe("https://url2");
  });
});

describe("getBalance", () => {
  test("returns successful balance", async () => {
    const httpCall = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          txids: [],
          claimed: [],
          balance: [
            {
              unspent: [],
              asset: "TEST",
              amount: 100,
              asset_hash: "hash_test",
            },
            {
              unspent: [{ value: 2, txid: "1", n: 1 }],
              asset: "NEO",
              amount: 2,
              asset_hash:
                "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b",
            },
            {
              unspent: [{ value: 5, txid: "1", n: 1 }],
              asset: "GAS",
              amount: 5,
              asset_hash:
                "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7",
            },
          ],
          address: "address",
        },
      })
    );
    axios.get = httpCall;
    expect(await neoscan.getBalance(testUrl, "address")).toEqual(
      new wallet.Balance({
        net: testUrl,
        address: "address",
        assetSymbols: ["GAS", "NEO"],
        assets: {
          NEO: {
            unspent: [{ value: 2, txid: "1", index: 1 }],
            balance: 2,
            hash: "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b",
          } as wallet.AssetBalanceLike,
          GAS: {
            unspent: [{ value: 5, txid: "1", index: 1 }],
            balance: 5,
            hash: "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7",
          } as wallet.AssetBalanceLike,
        },
        tokenSymbols: ["TEST"],
        tokens: {
          TEST: 100,
        },
        tokenHashes: { TEST: "hash_test" },
      } as wallet.BalanceLike)
    );
    expect(httpCall).toBeCalledWith(testUrl + "/v1/get_balance/address");
  });

  test("returns empty balance for new address", async () => {
    const httpCall = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          txids: null,
          claimed: null,
          balance: null,
          address: "not found",
        },
      })
    );
    axios.get = httpCall;
    expect(await neoscan.getBalance(testUrl, "address")).toEqual(
      new wallet.Balance({
        net: testUrl,
        address: "address",
      } as wallet.BalanceLike)
    );
  });
});

describe("getClaims", () => {
  test("returns successful claims", async () => {
    const httpCall = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          unclaimed: 1,
          claimable: [
            {
              value: 10,
              unclaimed: 1,
              txid: "1",
              sys_fee: 1337,
              start_height: 5,
              n: 2,
              generated: 1337,
              end_height: 11,
            },
          ],
          address: "address",
        },
      })
    );
    axios.get = httpCall;
    expect(await neoscan.getClaims(testUrl, "address")).toEqual(
      new wallet.Claims({
        net: testUrl,
        address: "address",
        claims: [
          {
            claim: 1,
            txid: "1",
            index: 2,
            value: 10,
            start: 5,
            end: 11,
            generated: 1337,
            sys_fee: 1337,
          },
        ],
      } as wallet.ClaimsLike)
    );
    expect(httpCall).toBeCalledWith(testUrl + "/v1/get_claimable/address");
  });

  test("returns empty claims", async () => {
    const httpCall = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          unclaimed: 0,
          claimable: [],
          address: "address",
        },
      })
    );
    axios.get = httpCall;
    expect(await neoscan.getClaims(testUrl, "address")).toEqual(
      new wallet.Claims({
        net: testUrl,
        address: "address",
      } as wallet.ClaimsLike)
    );
  });
});

describe("getMaxClaimAmount", () => {
  test("returns successful maxClaimAmount", async () => {
    const httpCall = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          address: "address",
          unclaimed: 1,
        },
      })
    );
    axios.get = httpCall;
    expect(await neoscan.getMaxClaimAmount(testUrl, "address")).toEqual(
      new u.Fixed8(1)
    );
    expect(httpCall).toBeCalledWith(testUrl + "/v1/get_unclaimed/address");
  });
});

describe("getHeight", () => {
  test("returns successful height", async () => {
    const httpCall = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          height: 123,
        },
      })
    );
    axios.get = httpCall;
    expect(await neoscan.getHeight(testUrl)).toEqual(123);
    expect(httpCall).toBeCalledWith(testUrl + "/v1/get_height");
  });
});

describe("getTransactionHistory", () => {
  test("returns successful TransactionHistory", async () => {
    const httpCall = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        data: [
          {
            vin: [
              {
                value: 0.1,
                txid: "0",
                n: 1,
                asset:
                  "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7",
                address_hash: "otherAddress",
              },
              {
                value: 0.023,
                txid: "0",
                n: 2,
                asset:
                  "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7",
                address_hash: "otherAddress",
              },
              {
                value: 5,
                txid: "0",
                n: 3,
                asset:
                  "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b",
                address_hash: "otherAddress",
              },
            ],
            vouts: [
              {
                value: 0.123,
                transaction_id: 14236119,
                asset:
                  "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7",
                address_hash: "address",
              },
              {
                value: 5,
                transaction_id: 14236119,
                asset:
                  "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b",
                address_hash: "address",
              },
            ],
            block_height: 11,
            txid: "1",
            type: "ContractTransaction",
            transfers: [],
            time: 1527812161,
            sys_fee: "0",
            size: 304,
            net_fee: "0",
            id: 14236119,
            claims: null,
            block_hash:
              "08ab749682b5cd5135ad36780abfc1ded6681c2772e39b53b69ed916ea02cdd7",
            asset: null,
          },
          {
            vin: [
              {
                value: 0.456,
                txid: "1",
                n: 1,
                asset:
                  "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7",
                address_hash: "address",
              },
              {
                value: 6,
                txid: "1",
                n: 2,
                asset:
                  "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b",
                address_hash: "address",
              },
            ],
            vouts: [
              {
                value: 0.456,
                transaction_id: 13244443,
                asset:
                  "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7",
                address_hash: "otherAddress",
              },
              {
                value: 6,
                transaction_id: 13244443,
                asset:
                  "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b",
                address_hash: "otherAddress",
              },
            ],
            block_height: 12,
            txid: "2",
            type: "ContractTransaction",
            transfers: [],
            time: 1527812165,
            sys_fee: "0",
            size: 304,
            net_fee: "0",
            id: 14236134,
            claims: null,
            block_hash:
              "08ab749682b5cd5135ad36780abfc1ded6681c2772e39a53b69ed916ea02cdd9",
            asset: null,
          },
          {
            vouts: [
              {
                value: 0.789,
                transaction_id: 12243317,
                asset:
                  "602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7",
                address_hash: "address",
              },
            ],
            vin: [],
            type: "ClaimTransaction",
            txid: "3",
            transfers: [],
            time: 1526265611,
            sys_fee: "0",
            size: 271,
            net_fee: "0",
            id: 12846317,
            claims: [
              {
                value: 16,
                txid: "11",
                n: 0,
                asset:
                  "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b",
                address_hash: "address",
              },
              {
                value: 546,
                txid: "12",
                n: 4,
                asset:
                  "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b",
                address_hash: "address",
              },
              {
                value: 654,
                txid: "13",
                n: 0,
                asset:
                  "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b",
                address_hash: "address",
              },
            ],
            block_height: 13,
            block_hash:
              "9c63a314dbb2584deca9361cf4d4be79232694cffc075a78eeae38d2a20a2bd5",
            asset: null,
          },
        ],
      })
    );
    axios.get = httpCall;
    expect(await neoscan.getTransactionHistory(testUrl, "address")).toEqual([
      {
        txid: "1",
        blockHeight: 11,
        change: { GAS: new u.Fixed8(0.123), NEO: new u.Fixed8(5) },
      },
      {
        txid: "2",
        blockHeight: 12,
        change: { GAS: new u.Fixed8(-0.456), NEO: new u.Fixed8(-6) },
      },
      {
        txid: "3",
        blockHeight: 13,
        change: { GAS: new u.Fixed8(0.789), NEO: new u.Fixed8(0) },
      },
    ]);
    expect(httpCall).toBeCalledWith(
      testUrl + "/v1/get_last_transactions_by_address/address"
    );
  });
});

describe("getAddressAbstracts", () => {
  test("returns successful address abstracts", async () => {
    const httpCall = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          total_pages: 34,
          total_entries: 503,
          page_size: 15,
          page_number: 24,
          entries: [
            {
              txid: "8bf8e45387386675d9f056e9d4b07d849c9d679f58df0d285a3d602f30540482",
              time: 1604950706,
              block_height: 6441795,
              asset:
                "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b",
              amount: "0",
              address_to: "AeGgZTTWPzyVtNiQRcpngkV75Xip1hznmi",
              address_from: "AeGgZTTWPzyVtNiQRcpngkV75Xip1hznmi",
            },
          ],
        },
      })
    );
    axios.get = httpCall;
    expect(await neoscan.getAddressAbstracts(testUrl, "address", 1)).toEqual({
      total_pages: 34,
      total_entries: 503,
      page_size: 15,
      page_number: 24,
      entries: [
        {
          txid: "8bf8e45387386675d9f056e9d4b07d849c9d679f58df0d285a3d602f30540482",
          time: 1604950706,
          block_height: 6441795,
          asset:
            "c56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b",
          amount: "0",
          address_to: "AeGgZTTWPzyVtNiQRcpngkV75Xip1hznmi",
          address_from: "AeGgZTTWPzyVtNiQRcpngkV75Xip1hznmi",
        },
      ],
    });
    expect(httpCall).toBeCalledWith(
      testUrl + "/v1/get_address_abstracts/address/1"
    );
  });
});
