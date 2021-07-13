import { logging, rpc, u, wallet } from "@cityofzion/neon-core";
import { ITransaction, PastTransaction, Provider } from "../common";
import { getBalance, getClaims, getMaxClaimAmount } from "./core";

const log = logging.default("api");

export class NeoCli implements Provider {
  public get name(): string {
    return `NeoCli[${this.url}]`;
  }
  private url: string;

  private rpc: rpc.RPCClient;

  public constructor(url: string) {
    this.url = url;
    this.rpc = new rpc.RPCClient(url);
    log.info(`Created NeoCli Provider: ${this.url}`);
  }
  public getRPCEndpoint(_noCache?: boolean | undefined): Promise<string> {
    return Promise.resolve(this.url);
  }
  public getBalance(address: string): Promise<wallet.Balance> {
    return getBalance(this.url, address);
  }
  public getClaims(address: string): Promise<wallet.Claims> {
    return getClaims(this.url, address);
  }
  public getMaxClaimAmount(address: string): Promise<u.Fixed8> {
    return getMaxClaimAmount(this.url, address);
  }
  public getHeight(): Promise<number> {
    return this.rpc.getBlockCount();
  }
  public getTransactionHistory(_address: string): Promise<PastTransaction[]> {
    throw new Error("Method not implemented.");
  }
}

export default NeoCli;
