import { u, wallet } from "@cityofzion/neon-core";
import axios from "axios";
import * as internal from "../../settings";
import {
  filterHttpsOnly,
  findGoodNodesFromHeight,
  getBestUrl,
  ITransaction,
  RpcNode,
  Vin,
  Vout,
} from "../common";
import { transformBalance, transformClaims } from "../neoCli/transform";
import {
  DoraGetBalanceResponse,
  DoraGetClaimableResponse,
  DoraGetUnclaimedResponse,
  DoraTransaction,
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

function parseVin(vin: Required<Pick<Vin, "txid" | "vout">>[]): Vin[] {
  return vin.map((it) => {
    return {
      txid: it.txid,
      vout: it.vout,
    };
  });
}

function parseVout(
  vouts: Required<Omit<Vout, "address_hash" | "txid">>[]
): Vout[] {
  return vouts.map((it) => {
    return {
      asset: it.asset,
      n: it.n,
      value: it.value,
      address: it.address,
    };
  });
}

function parseTransaction(
  data: DoraTransaction
): ITransaction & Pick<DoraTransaction, "jsonsize"> {
  return {
    attributes: data.attributes,
    block_height: data.block,
    claims: data.claims,
    net_fee: Number(data.net_fee),
    scripts: data.scripts,
    size: data.size,
    sys_fee: Number(data.sys_fee),
    time: Number(data.time),
    txid: data.txid,
    type: data.type,
    version: data.version,
    vin: parseVin(data.vin),
    vouts: parseVout(data.vout),
    jsonsize: data.jsonsize,
  };
}

export async function getTransaction(
  url: string,
  txid: string
): Promise<ITransaction & Pick<DoraTransaction, "jsonsize">> {
  const response = await axios.get(`${url}/transaction/${txid}`);
  const data = response.data as DoraTransaction;
  return parseTransaction(data);
}
