import { logging, settings, u, wallet } from "@cityofzion/neon-core";
import { ITransaction, PastTransaction, Provider } from "../common";
import {
  getBalance,
  getClaims,
  getHeight,
  getMaxClaimAmount,
  getRPCEndpoint,
  getTransaction,
} from "./core";
import { DoraTransaction } from "./responses";

const log = logging.default("api");

interface DoraProvider extends Provider {
  getTransaction: (
    txid: string
  ) => Promise<ITransaction & Pick<DoraTransaction, "jsonsize">>;
}

export class Dora implements DoraProvider {
  private url: string;

  public get name(): string {
    return `Dora[${this.url}]`;
  }

  public constructor(url: string) {
    if (settings.networks[url] && settings.networks[url].extra.dora) {
      this.url = settings.networks[url].extra.dora;
    } else {
      this.url = url;
    }
    log.info(`Created Neoscan Provider: ${this.url}`);
  }

  public getRPCEndpoint(): Promise<string> {
    return getRPCEndpoint(this.url);
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
  public async getTransactionHistory(
    _address: string
  ): Promise<PastTransaction[]> {
    throw new Error("Method not implemented.");
  }
  public getTransaction(
    txid: string
  ): Promise<ITransaction & Pick<DoraTransaction, "jsonsize">> {
    return getTransaction(this.url, txid);
  }
}

export default Dora;
