import axios from "axios";
import * as dora from "../../../src/provider/dora/core";
import { rpc, settings } from "@cityofzion/neon-core";
const testUrl = "http://testurl.com";

describe("getAddressAbstracts", () => {
  beforeEach(() => {
    jest.resetModules();
    settings.networks.UnitTestNet = new rpc.Network({
      name: "UnitTestNet",
      extra: { neonDB: testUrl, dora: "http://wrongurl.com" },
    });
  });
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
    expect(await dora.getAddressAbstracts(testUrl, "address", 1)).toEqual({
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
      testUrl + "/get_address_abstracts/address/1"
    );
  });
});
