import { logging, settings, u, wallet } from "@cityofzion/neon-core";
import { AddressAbstract, PastTransaction, Provider } from "../common";
import {
  getBalance,
  getClaims,
  getHeight,
  getMaxClaimAmount,
  getRPCEndpoint,
  getAddressAbstracts,
} from "./core";

const log = logging.default("api");

interface DoraProvider extends Provider {
  getAddressAbstracts: (
    address: string,
    page: number
  ) => Promise<AddressAbstract>;
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
    log.info(`Created Dora Provider: ${this.url}`);
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
  public getAddressAbstracts(
    address: string,
    page: number
  ): Promise<AddressAbstract> {
    return getAddressAbstracts(this.url, address, page);
  }
}

export default Dora;
