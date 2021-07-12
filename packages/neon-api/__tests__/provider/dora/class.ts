import { rpc, settings } from "@cityofzion/neon-core";
import dora from "../../../src/provider/dora/class";
import * as core from "../../../src/provider/dora/core";
jest.mock("../../../src/provider/dora/core");

const unitTestNetUrl = "http://testurl.com";
beforeEach(() => {
  jest.resetModules();
  settings.networks.UnitTestNet = new rpc.Network({
    name: "UnitTestNet",
    extra: { dora: unitTestNetUrl, neonDB: "http://wrongurl.com" },
  });
});

describe("constructor", () => {
  test("url", () => {
    const expectedUrl = "www.test.com";
    const result = new dora(expectedUrl);
    expect(result.name).toMatch(expectedUrl);
  });

  test("Network name", () => {
    const result = new dora("UnitTestNet");
    expect(result.name).toMatch(unitTestNetUrl);
  });
});

test("getBalance", async () => {
  const expectedUrl = "www.test.com";
  const expectedAddress = "address";
  const obj = new dora(expectedUrl);
  await obj.getBalance(expectedAddress);
  expect(core.getBalance).toBeCalledWith(expectedUrl, expectedAddress);
});

test("getClaims", async () => {
  const expectedUrl = "www.test.com";
  const expectedAddress = "address";
  const obj = new dora(expectedUrl);
  await obj.getClaims(expectedAddress);
  expect(core.getClaims).toBeCalledWith(expectedUrl, expectedAddress);
});

test("getMaxClaimAmount", async () => {
  const expectedUrl = "www.test.com";
  const expectedAddress = "address";
  const obj = new dora(expectedUrl);
  await obj.getMaxClaimAmount(expectedAddress);
  expect(core.getMaxClaimAmount).toBeCalledWith(expectedUrl, expectedAddress);
});

test("getHeight", async () => {
  const expectedUrl = "www.test.com";
  const obj = new dora(expectedUrl);
  await obj.getHeight();
  expect(core.getHeight).toBeCalledWith(expectedUrl);
});

test("getAddressAbstracts", async () => {
  const expectedUrl = "www.test.com";
  const expectedAddress = "address";
  const expectedPage = 1;
  const obj = new dora(expectedUrl);
  await obj.getAddressAbstracts(expectedAddress, expectedPage);
  expect(core.getAddressAbstracts).toBeCalledWith(
    expectedUrl,
    expectedAddress,
    expectedPage
  );
});
