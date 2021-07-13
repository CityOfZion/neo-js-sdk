import { logging, rpc, settings, u, wallet } from "@cityofzion/neon-core";
import { ITransaction, PastTransaction, Provider } from "../common";
import {
  getBalance,
  getClaims,
  getHeight,
  getMaxClaimAmount,
  getRPCEndpoint,
  getTransactionHistory,
} from "./core";
const log = logging.default("api");

export class NeonDB implements Provider {
  private url: string;

  public get name(): string {
    return `NeonDB[${this.url}]`;
  }

  private rpc: rpc.RPCClient | null = null;
  private cacheExpiry: Date | null = null;

  public constructor(url: string) {
    if (settings.networks[url] && settings.networks[url].extra.neonDB) {
      this.url = settings.networks[url].extra.neonDB;
    } else {
      this.url = url;
    }
    log.info(`Created NeonDB Provider: ${this.url}`);
  }

  public async getRPCEndpoint(noCache = false): Promise<string> {
    if (
      !noCache &&
      this.rpc &&
      this.cacheExpiry &&
      this.cacheExpiry < new Date()
    ) {
      const ping = await this.rpc.ping();
      if (ping <= 1000) {
        return this.rpc.net;
      }
    }
    const rpcAddress = await getRPCEndpoint(this.url);
    this.rpc = new rpc.RPCClient(rpcAddress);
    this.cacheExpiry = new Date(new Date().getTime() + 5 * 60000);
    return this.rpc.net;
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
    return getHeight(this.url);
  }
  public getTransactionHistory(address: string): Promise<PastTransaction[]> {
    return getTransactionHistory(this.url, address);
  }
}

export default NeonDB;
