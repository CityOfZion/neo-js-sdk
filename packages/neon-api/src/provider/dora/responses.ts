import { NeoCliBalance, NeoCliClaimable } from "../neoCli/responses";
import { AddressAbstract, Entry } from "../common";
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

export type TEntry = Omit<Entry, "amount"> & { amount: number };

export interface DoraAddressAbstracts
  extends Omit<AddressAbstract, "entries"> {
  entries: TEntry[];
}
