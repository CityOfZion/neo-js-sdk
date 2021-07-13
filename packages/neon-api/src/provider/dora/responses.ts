import { ITransaction, Vin, Vout } from "../common";
import { NeoCliBalance, NeoCliClaimable } from "../neoCli/responses";
export interface DoraGetBalanceResponse {
  balance: NeoCliBalance[];
  address: string;
}

export interface DoraGetUnclaimedResponse {
  available: number;
  unavailable: number;
  unclaimed: number;
}

export interface DoraGetClaimableResponse {
  address: string;
  claimable: NeoCliClaimable[];
  unclaimed: number;
}

export interface DoraTransaction
  extends Omit<
    ITransaction,
    "sys_fee" | "net_fee" | "time" | "vin" | "vout" | "block_height"
  > {
  sys_fee: string;
  net_fee: string;
  time: string;
  vin: Required<Pick<Vin, "txid" | "vout">>[];
  vout: Required<Omit<Vout, "address_hash" | "txid">>[];
  block: number;
  jsonsize: number;
}
