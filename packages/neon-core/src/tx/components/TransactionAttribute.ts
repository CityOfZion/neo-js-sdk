import {
  num2hexstring,
  num2VarInt,
  StringStream,
  ensureHex,
  str2hexstring
} from "../../u";
import { TxAttrUsage } from "./txAttrUsage";

const maxTransactionAttributeSize = 65535;

export interface TransactionAttributeLike {
  usage: number | string;
  data: string;
}

export function toTxAttrUsage(
  type: TxAttrUsage | string | number
): TxAttrUsage {
  if (typeof type === "string") {
    if (type in TxAttrUsage) {
      return TxAttrUsage[type as keyof typeof TxAttrUsage];
    }
    throw new Error(`${type} not found in TxAttrUsage!`);
  } else if (typeof type === "number") {
    if (TxAttrUsage.Url !== type) {
      throw new Error(`${type} not found in TxAttrUsage!`);
    }
  }

  return type as TxAttrUsage;
}

/**
 * An attribute that is used to decorate the transaction.
 * Used for appending additional information to the transaction.
 *
 * For example, a remark is attached as an attribute.
 */
export class TransactionAttribute {
  public static deserialize(hex: string): TransactionAttribute {
    const ss = new StringStream(hex);
    return this.fromStream(ss);
  }

  public static fromStream(ss: StringStream): TransactionAttribute {
    const usage = parseInt(ss.read(1), 16);
    const data: string = ss.readVarBytes();
    return new TransactionAttribute({ usage, data });
  }

  public usage: TxAttrUsage;

  /**
   * @description data in hex format
   */
  public data: string;

  public constructor(obj: TransactionAttributeLike) {
    if (!obj.usage || !obj.data) {
      throw new Error("TransactionAttribute requires usage and data fields");
    }
    const { usage, data } = obj;
    this.usage = toTxAttrUsage(usage);
    ensureHex(data);
    this.data = data;
  }

  /**
   * @param url url string in ASCII format
   */
  public static Url(url: string): TransactionAttribute {
    return new TransactionAttribute({
      usage: TxAttrUsage.Url,
      data: str2hexstring(url)
    });
  }

  public get [Symbol.toStringTag](): string {
    return "TransactionAttribute";
  }

  public serialize(): string {
    if (this.data.length > maxTransactionAttributeSize) {
      throw new Error(`Data size too big!`);
    }
    let out = num2hexstring(this.usage);
    out += num2VarInt(this.data.length / 2);
    out += this.data;
    return out;
  }

  public export(): TransactionAttributeLike {
    return {
      usage: this.usage,
      data: this.data
    };
  }

  public equals(other: TransactionAttributeLike): boolean {
    return (
      this.usage === toTxAttrUsage(other.usage) && this.data === other.data
    );
  }
}

export default TransactionAttribute;
