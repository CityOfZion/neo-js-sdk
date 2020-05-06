import {
  WitnessScope,
  parse as parseWitnessScope,
  toString,
} from "./WitnessScope";
import { StringStream, num2hexstring, HexString } from "../../u";
import { deserializeArrayOf, serializeArrayOf } from "../lib";

export interface CosignerLike {
  /* account scripthash in big endian */
  account: string | HexString;
  scopes: number;
  allowedContracts?: (string | HexString)[];
  allowedGroups?: (string | HexString)[];
}

export interface CosignerJson {
  // Scripthash of the account (BE & Ox)
  account: string;
  // Comma-delimited flags in English
  scopes: string;
  // Array of scripthashes (BE & Ox)
  allowedContracts?: string[];
  // Array of public keys (BE)
  allowedGroups?: string[];
}

export class Cosigner {
  /**
   * scripthash of cosigner
   */
  public account: HexString;

  public scopes: WitnessScope;
  /**
   * List of scripthashes of allowed contracts. Only present when WitnessScope.CustomContracts is present in scopes.
   */
  public allowedContracts: HexString[];
  /**
   * List of public keys of allowed groups. Only present when WitnessScope.CustomGroups is present in scopes.
   */
  public allowedGroups: HexString[];

  public static fromJson(input: CosignerJson): Cosigner {
    return new Cosigner({
      account: input.account,
      scopes: parseWitnessScope(input.scopes),
      allowedContracts: input.allowedContracts ?? [],
      allowedGroups: input.allowedGroups ?? [],
    });
  }

  public constructor(signer: Partial<CosignerLike | Cosigner> = {}) {
    const {
      account = "",
      scopes = WitnessScope.Global,
      allowedContracts = [],
      allowedGroups = [],
    } = signer;
    this.account = HexString.fromHex(account);
    this.scopes = scopes & 0xff;
    this.allowedContracts = allowedContracts.map((i) => HexString.fromHex(i));
    this.allowedGroups = allowedGroups.map((i) => HexString.fromHex(i));
  }

  /**
   * Returns the number of bytes this object will take when serialized.
   */
  public get size(): number {
    return (
      20 +
      1 +
      this.allowedContracts.length * 20 +
      this.allowedGroups.length * 33
    );
  }

  public addAllowedContracts(...contracts: string[]): void {
    this.scopes |= WitnessScope.CustomContracts;
    contracts
      .map((i) => HexString.fromHex(i))
      .forEach((i) => this.allowedContracts.push(i));
  }

  public addAllowedGroups(...groups: string[]): void {
    this.scopes |= WitnessScope.CustomGroups;
    groups
      .map((i) => HexString.fromHex(i))
      .forEach((i) => this.allowedGroups.push(i));
  }

  public static deserialize(ss: StringStream): Cosigner {
    const account = HexString.fromHex(ss.read(20), true);
    const scopes = parseInt(ss.read(), 16);

    const allowedContracts =
      scopes & WitnessScope.CustomContracts
        ? deserializeArrayOf((s) => HexString.fromHex(s.read(20), true), ss)
        : [];
    const allowedGroups =
      scopes & WitnessScope.CustomGroups
        ? deserializeArrayOf((s) => HexString.fromHex(s.read(33)), ss)
        : [];
    return new Cosigner({ account, scopes, allowedContracts, allowedGroups });
  }

  public serialize(): string {
    let out = "";
    out += this.account.toLittleEndian();
    out += num2hexstring(this.scopes, 1);
    if (this.scopes & WitnessScope.CustomContracts) {
      out += serializeArrayOf(
        this.allowedContracts.map((i) => i.toLittleEndian())
      );
    }
    if (this.scopes & WitnessScope.CustomGroups) {
      out += serializeArrayOf(this.allowedGroups.map((i) => i.toBigEndian()));
    }

    return out;
  }

  public export(): CosignerLike {
    return {
      account: this.account.toBigEndian(),
      scopes: this.scopes,
      allowedContracts: [...this.allowedContracts.map((i) => i.toBigEndian())],
      allowedGroups: [...this.allowedGroups.map((i) => i.toBigEndian())],
    };
  }

  public toJson(): CosignerJson {
    const output: CosignerJson = {
      account: "0x" + this.account.toBigEndian(),
      scopes: toString(this.scopes),
    };
    if (this.scopes & WitnessScope.CustomContracts) {
      output.allowedContracts = [
        ...this.allowedContracts.map((i) => "0x" + i.toBigEndian()),
      ];
    }
    if (this.scopes & WitnessScope.CustomGroups) {
      output.allowedGroups = [
        ...this.allowedGroups.map((i) => i.toBigEndian()),
      ];
    }
    return output;
  }
}

export default Cosigner;
