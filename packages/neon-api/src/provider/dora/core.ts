import { u, wallet } from "@cityofzion/neon-core";
import axios from "axios";
import * as internal from "../../settings";
import {
  filterHttpsOnly,
  findGoodNodesFromHeight,
  getBestUrl,
  AddressAbstract,
  RpcNode,
  Entry,
} from "../common";
import { DoraAddressAbstracts, TEntry } from "../dora/responses";
import { transformBalance, transformClaims } from "../neoCli/transform";
import {
  DoraGetBalanceResponse,
  DoraGetClaimableResponse,
  DoraGetUnclaimedResponse,
} from "./responses";

export async function getRPCEndpoint(url: string): Promise<string> {
  const response = await axios.get(`${url}/get_all_nodes`);
  let nodes = response.data as RpcNode[];
  if (internal.settings.httpsOnly) {
    nodes = filterHttpsOnly(nodes);
  }
  const goodNodes = findGoodNodesFromHeight(nodes);
  const bestRPC = await getBestUrl(goodNodes);
  return bestRPC;
}

export async function getBalance(
  url: string,
  address: string
): Promise<wallet.Balance> {
  const response = await axios.get(`${url}/get_balance/${address}`);
  const data = response.data as DoraGetBalanceResponse;
  if (!data.address) {
    throw new Error("No response. Address might be malformed.");
  }

  return transformBalance({ net: url, address, balance: data.balance });
}

export async function getClaims(
  url: string,
  address: string
): Promise<wallet.Claims> {
  const response = await axios.get(`${url}/get_claimable/${address}`);
  const data = response.data as DoraGetClaimableResponse;
  if (!data.address) {
    throw new Error("No response. Address might be malformed.");
  }

  return transformClaims({ net: url, address, claims: data.claimable });
}

export async function getHeight(url: string): Promise<number> {
  const response = await axios.get(`${url}/height`);
  return response.data.height;
}

export async function getMaxClaimAmount(
  url: string,
  address: string
): Promise<u.Fixed8> {
  const response = await axios.get(`${url}/get_unclaimed/${address}`);
  const data = response.data as DoraGetUnclaimedResponse;
  if (data.unclaimed === undefined) {
    throw new Error("No response. Address might be malformed.");
  }

  return new u.Fixed8(data.unclaimed);
}

function parseEntries(entries: TEntry[]): Entry[] {
  return entries.map((it) => {
    return { ...it, amount: String(it.amount) };
  });
}

export async function getAddressAbstracts(
  url: string,
  address: string,
  page: number
): Promise<AddressAbstract> {
  const response = await axios.get(
    `${url}/get_address_abstracts/${address}/${page}`
  );
  const data = response.data as DoraAddressAbstracts;
  return { ...data, entries: parseEntries(data.entries) };
}
