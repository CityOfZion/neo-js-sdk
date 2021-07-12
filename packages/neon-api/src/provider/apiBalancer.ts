import { logging, u, wallet } from "@cityofzion/neon-core";
import { AddressAbstract, PastTransaction, Provider } from "./common";
const log = logging.default("api");

export default class ApiBalancer implements Provider {
  public leftProvider: Provider;
  public rightProvider: Provider;

  public get name(): string {
    return `${this.leftProvider.name}ApiBalancer${this.rightProvider.name}`;
  }

  private _preference = 0;
  public get preference(): number {
    return this._preference;
  }
  public set preference(val: number) {
    const newVal = Math.max(0, Math.min(1, val));
    if (newVal !== this._preference) {
      log.info(`Preference set to ${newVal}`);
    }
    this._preference = newVal;
  }

  private _frozen = false;
  public get frozen(): boolean {
    return this._frozen;
  }
  public set frozen(val: boolean) {
    if (this._frozen !== val) {
      val
        ? log.info(`ApiBalancer frozen at preference of ${this._preference}`)
        : log.info("ApiBalancer unfrozen");
    }
    this._frozen = val;
  }

  public constructor(
    leftProvider: Provider,
    rightProvider: Provider,
    preference = 0,
    frozen = false
  ) {
    this.leftProvider = leftProvider;
    this.rightProvider = rightProvider;
    this.preference = preference;
    this.frozen = frozen;
  }

  public async getRPCEndpoint(): Promise<string> {
    const f = async (p: Provider): Promise<string> => await p.getRPCEndpoint();
    return await this.loadBalance(f);
  }

  public async getBalance(address: string): Promise<wallet.Balance> {
    const f = async (p: Provider): Promise<wallet.Balance> =>
      await p.getBalance(address);
    return await this.loadBalance(f);
  }

  public async getClaims(address: string): Promise<wallet.Claims> {
    const f = async (p: Provider): Promise<wallet.Claims> =>
      await p.getClaims(address);
    return await this.loadBalance(f);
  }

  public async getMaxClaimAmount(address: string): Promise<u.Fixed8> {
    const f = async (p: Provider): Promise<u.Fixed8> =>
      await p.getMaxClaimAmount(address);
    return await this.loadBalance(f);
  }

  public async getHeight(): Promise<number> {
    const f = async (p: Provider): Promise<number> => await p.getHeight();
    return await this.loadBalance(f);
  }

  public async getTransactionHistory(
    address: string
  ): Promise<PastTransaction[]> {
    const f = async (p: Provider): Promise<PastTransaction[]> =>
      await p.getTransactionHistory(address);
    return await this.loadBalance(f);
  }

  /**
   * Load balances a API call according to the API switch. Selects the appropriate provider and sends the call towards it.
   * @param func - The API call to load balance function
   */
  private async loadBalance<T>(func: (provider: Provider) => T): Promise<T> {
    const i = Math.random() > this._preference ? 0 : 1;
    const primary = i === 0 ? this.leftProvider : this.rightProvider;
    try {
      const result = await func(primary);
      i === 0 ? this.increaseLeftWeight() : this.increaseRightWeight();
      return result;
    } catch {
      const secondary = i === 0 ? this.rightProvider : this.leftProvider;
      i === 1 ? this.increaseLeftWeight() : this.increaseRightWeight();
      return await func(secondary);
    }
  }

  private increaseLeftWeight(): void {
    if (!this._frozen) {
      this.preference -= 0.2;
      log.info(
        `core API Switch increasing weight towards ${this.leftProvider.name}`
      );
    }
  }

  private increaseRightWeight(): void {
    if (!this._frozen) {
      this.preference += 0.2;
      log.info(
        `core API Switch increasing weight towards ${this.rightProvider.name}`
      );
    }
  }
}
