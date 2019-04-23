import { Fixed8, reverseHex } from "../u";
import { getScriptHashFromAddress, isAddress } from "../wallet";

export enum ContractParamType {
  Signature = 0x00,
  Boolean = 0x01,
  Integer = 0x02,
  Hash160 = 0x03,
  Hash256 = 0x04,
  ByteArray = 0x05,
  PublicKey = 0x06,
  String = 0x07,
  Array = 0x10,
  InteropInterface = 0xf0,
  Void = 0xff
}

export interface ContractParamLike {
  type: string;
  value: string | number | boolean | ContractParamLike[];
}

function toContractParamType(
  type: ContractParamType | string | number
): ContractParamType {
  if (typeof type === "string") {
    if (type in ContractParamType) {
      return ContractParamType[type as keyof typeof ContractParamType];
    }
    throw new Error(`${type} not found in ContractParamType!`);
  }
  return type;
}

/** Checks if given Fixed8 has maximum decimals places.
 * For example, precision
 */
function checkNumberWithinPrecision(val: Fixed8, decimalPlaces: number): void {
  const shiftedVal = val.times(Math.pow(10, decimalPlaces));
  const modValue = shiftedVal.mod(1);
  if (!modValue.isZero()) {
    throw new Error(`wrong precision: expected ${decimalPlaces}`);
  }
}

/**
 * Contract input parameters.
 * These are mainly used as parameters to pass in for RPC test invokes.
 */
export class ContractParam {
  /**
   * Creates a String ContractParam.
   */
  public static string(value: string): ContractParam {
    return new ContractParam(ContractParamType.String, value);
  }

  /**
   * Creates a Boolean ContractParam. Does basic checks to convert value into a boolean.
   */
  public static boolean(value: string | number | boolean): ContractParam {
    return new ContractParam(ContractParamType.Boolean, !!value);
  }

  /**
   * Creates a Hash160 ContractParam. This is used for containing a scriptHash. Do not reverse the input if using this format.
   * @param {string} value - A 40 character long hexstring. Automatically converts an address to scripthash if provided.
   * @return {ContractParam}
   */
  public static hash160(value: string): ContractParam {
    if (typeof value !== "string") {
      throw new Error(
        `hash160 expected a string but got ${typeof value} instead.`
      );
    }
    if (isAddress(value)) {
      value = getScriptHashFromAddress(value);
    }
    if (value.length !== 40) {
      throw new Error(
        `hash160 expected a 40 character string but got ${
          value.length
        } chars instead.`
      );
    }
    return new ContractParam(ContractParamType.Hash160, value);
  }

  /**
   * Creates an Integer ContractParam. This is converted into an BigInteger in NeoVM.
   * @param {string | number } value - A value that can be parsed to an BigInteger. Numbers or numeric strings are accepted.
   * @example
   * ContractParam.integer(128)
   * ContractParam.integer("128")
   */
  public static integer(value: string | number): ContractParam {
    const num =
      typeof value === "string"
        ? value.split(".")[0]
        : Math.round(value).toString();
    return new ContractParam(ContractParamType.Integer, num);
  }

  /**
   * Creates a ByteArray ContractParam.
   * @param value
   * @param format The format that this value represents. Different formats are parsed differently.
   * @param args Additional arguments such as decimal precision
   */
  public static byteArray(
    value: string | boolean | number,
    format: string,
    ...args: any[]
  ): ContractParam {
    if (format) {
      format = format.toLowerCase();
    }
    if (format === "address" && typeof value === "string") {
      return new ContractParam(
        ContractParamType.ByteArray,
        reverseHex(getScriptHashFromAddress(value))
      );
    } else if (format === "fixed8" && typeof value === "number") {
      let decimals = 8;
      if (args.length === 1) {
        decimals = args[0];
      }
      if (!isFinite(value)) {
        throw new Error(`Input should be number!`);
      }
      const divisor = new Fixed8(Math.pow(10, 8 - decimals));
      const fixed8Value = new Fixed8(value);
      checkNumberWithinPrecision(fixed8Value, decimals);
      const adjustedValue = fixed8Value.div(divisor);
      return new ContractParam(
        ContractParamType.ByteArray,
        adjustedValue.toReverseHex().slice(0, 16)
      );
    } else {
      return new ContractParam(ContractParamType.ByteArray, value);
    }
  }

  /**
   * Creates an Array ContractParam.
   * @param params params to be encapsulated in an array.
   */
  public static array(...params: ContractParam[]): ContractParam {
    return new ContractParam(ContractParamType.Array, params);
  }

  public type: ContractParamType;
  public value: string | number | boolean | ContractParam[];

  public constructor(
    type:
      | ContractParam
      | ContractParamLike
      | ContractParamType
      | keyof typeof ContractParamType
      | number,
    value?: string | number | boolean | ContractParam[]
  ) {
    if (typeof type === "object") {
      const cpLike = type;
      this.type = toContractParamType(cpLike.type);
      if (typeof cpLike.value === "object") {
        if (this.type !== ContractParamType.Array) {
          throw new Error(
            "Inconsistent data provided! The type field must be Array!"
          );
        }
        this.value = [];
        for (var i = 0; i < cpLike.value.length; i++) {
          this.value.push(new ContractParam(cpLike.value[i]));
        }
      } else {
        this.value = cpLike.value;
      }
    } else if (type !== undefined && value !== undefined) {
      this.type = toContractParamType(type);
      this.value = value;
    } else {
      throw new Error("No constructor arguments provided!");
    }
  }

  public get [Symbol.toStringTag](): string {
    return "ContractParam:" + ContractParamType[this.type];
  }

  public export(): ContractParamLike {
    const exportedValue = Array.isArray(this.value)
      ? this.value.map(cp => cp.export())
      : this.value;
    return { type: ContractParamType[this.type], value: exportedValue };
  }

  public equal(other: ContractParamLike): boolean {
    if (
      this.type === toContractParamType(other.type) &&
      Array.isArray(this.value) &&
      Array.isArray(other.value) &&
      this.value.length === other.value.length
    ) {
      for (var i = 0; i < this.value.length; i++) {
        if (!this.value[i].equal(other.value[i])) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
}

export default ContractParam;

export function likeContractParam(cp: Partial<ContractParam>): boolean {
  if (cp === null || cp === undefined) {
    return false;
  }
  if (cp instanceof ContractParam) {
    return true;
  }
  return (
    cp.type !== null &&
    cp.type !== undefined &&
    cp.type in ContractParamType &&
    cp.value !== null &&
    cp.value !== undefined
  );
}
