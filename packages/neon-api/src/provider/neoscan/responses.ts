import { ITransaction, Vin, Vout } from "../common";
export interface NeoscanV1GetBalanceResponse {
  balance: NeoscanBalance[] | null;
  address: string;
}

export interface NeoscanBalance {
  asset: string;
  amount: number;
  unspent: NeoscanTx[];
  asset_hash: string;
  asset_symbol: string;
}

export interface NeoscanTx {
  txid: string;
  value: number;
  n: number;
}

export interface NeoscanV1GetClaimableResponse {
  unclaimed: number;
  claimable: NeoscanClaim[] | null;
  address: string;
}

export interface NeoscanClaim {
  txid: string;
  n: number;
  value: number;
  unclaimed: number;
  start_height: number;
  end_height: number;
  sys_fee: number;
  generated: number;
}

export interface NeoscanV1GetUnclaimedResponse {
  unclaimed: number;
  address: string;
}

export interface NeoscanV1GetHeightResponse {
  height: number;
}

export interface NeoscanTransaction
  extends Omit<ITransaction, "vin" | "vouts"> {
  asset: null;
  block_hash: string;
  contract: null;
  description: null;
  nonce: null;
  pubkey: null;
  vin: Required<Omit<Vin, "vout">>[];
  vouts: Required<Omit<Vout, "address">>[];
}

export interface NeoscanPastTx {
  vouts: [
    {
      value: number;
      txid: string;
      n: number;
      asset: string;
      address_hash: string;
    }
  ];
  vin: [
    {
      value: number;
      txid: string;
      n: number;
      asset: string;
      address_hash: string;
    }
  ];
  type: string;
  txid: string;
  transfers: [
    {
      txid: string;
      time: number;
      contract: string;
      block_height: number;
      amount: number;
      address_to: string;
      address_from: string;
    }
  ];
  time: number;
  sys_fee: number;
  size: number;
  net_fee: number;
  id: number;
  claims: {
    value: number;
    txid: string;
    n: number;
    asset: string;
    address_hash: string;
  }[];
  block_height: number;
  block_hash: string;
  asset: null;
}
