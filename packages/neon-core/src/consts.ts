export const ADDR_VERSION = "35";

export const MAGIC_NUMBER = {
  MainNet: 5195086,
  TestNet: 1951352142,
};

export const NATIVE_CONTRACTS: { [key: string]: string } = {
  NEO: "NEO",
  "9bde8f209c88dd0e7ca3bf0af0f476cdd8207789": "NEO",
  GAS: "GAS",
  "8c23f196d8a1bfd103a9dcb1f9ccf0c611377d3b": "GAS",
  POLICY: "3209d09120465bf181ced70693b897ec6ea4619a",
};

export const ASSET_ID: { [key: string]: string } = {
  NEO: "9bde8f209c88dd0e7ca3bf0af0f476cdd8207789",
  GAS: "8c23f196d8a1bfd103a9dcb1f9ccf0c611377d3b",
};

export const ASSET_TYPE: { [key: string]: number } = {
  CreditFlag: 0x40,
  DutyFlag: 0x80,
  GoverningToken: 0x00,
  UtilityToken: 0x01,
  Currency: 0x08,
  Share: 0x90, // (= DutyFlag | 0x10)
  Invoice: 0x98, // (= DutyFlag | 0x18)
  Token: 0x60, // (= CreditFlag | 0x20)
};
export const CONTRACTS: { [key: string]: string } = {
  RPX: "ecc6b20d3ccac1ee9ef109af5a7cdb85706b1df9",
  TEST_RPX: "5b7074e873973a6ed3708862f219a6fbf4d1c411",
  TEST_LWTF: "d7678dd97c000be3f33e9362e673101bac4ca654",
  TEST_NXT: "0b6c1f919e95fe61c17a7612aebfaf4fda3a2214",
  TEST_RHTT4: "f9572c5b119a6b5775a6af07f1cef5d310038f55",
};

export const DEFAULT_RPC: { [key: string]: string } = {
  MAIN: "https://seed11.ngd.network:10331",
  TEST: "https://seed11.ngd.network:20331",
};

export const DEFAULT_REQ = {
  jsonrpc: "2.0",
  method: "getblockcount",
  params: [],
  id: 1234,
};

export const DEFAULT_SCRYPT = {
  n: 16384,
  r: 8,
  p: 8,
  size: 64,
};

export const DEFAULT_WALLET = {
  name: "myWallet",
  version: "1.0",
  scrypt: DEFAULT_SCRYPT,
  extra: null,
};

export const DEFAULT_ACCOUNT_CONTRACT = {
  script: "",
  parameters: [
    {
      name: "signature",
      type: "Signature",
    },
  ],
  deployed: false,
};

export const NEO_NETWORK: { [key: string]: string } = {
  MAIN: "MainNet",
  TEST: "TestNet",
};

// specified by nep2, same as bip38
export const NEP_HEADER = "0142";

export const NEP_FLAG = "e0";

export const RPC_VERSION = "2.3.2";

// transaction related
export const TX_VERSION = 0;

export const SYSTEM_FEE_FACTOR = 1;

export const SYSTEM_FEE_FREE = 0;

// you can also get this value by querying policy native contract method `getFeePerByte`
export const POLICY_FEE_PERBYTE = 1000e-8;
