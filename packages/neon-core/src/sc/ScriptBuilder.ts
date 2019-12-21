import BN from "bn.js";
import {
  ensureHex,
  num2hexstring,
  reverseHex,
  str2hexstring,
  StringStream,
  Fixed8
} from "../u";
import ContractParam, {
  ContractParamType,
  likeContractParam
} from "./ContractParam";
import OpCode from "./OpCode";
import InteropServiceCode from "./InteropServiceCode";
import { ASSET_ID } from "../consts";

export interface ScriptIntent {
  scriptHash: string | "NEO" | "GAS" | "POLICY";
  operation?: string;
  args?: unknown[];
}

export interface ScriptResult {
  hex: string;
  fee: Fixed8;
}

/**
 * Builds a VM script in hexstring. Used for constructing smart contract method calls.
 * @extends StringStream
 */
export class ScriptBuilder extends StringStream {
  /**
   * Appends an Opcode, followed by args
   */
  public emit(op: OpCode, args?: string): this {
    this.str += op;
    if (args) {
      this.str += args;
    }
    return this;
  }

  public emitSysCall(service: InteropServiceCode, ...args: unknown[]): this {
    for (let i = args.length - 1; i >= 0; i--) {
      this.emitPush(args[i]);
    }
    return this.emit(OpCode.SYSCALL, service);
  }

  public emitAppCall(
    scriptHash: string,
    operation?: string,
    args?: unknown[]
  ): this {
    this.emitPush(args || []);
    if (operation) {
      this._emitString(str2hexstring(operation));
    }

    if (scriptHash.toUpperCase() === "NEO") {
      scriptHash = ASSET_ID.NEO;
    } else if (scriptHash.toUpperCase() === "GAS") {
      scriptHash = ASSET_ID.GAS;
    } else if (scriptHash.toUpperCase() === "POLICY") {
      scriptHash = ASSET_ID.POLICY;
    }
    ensureHex(scriptHash);
    if (scriptHash.length !== 40) {
      throw new Error("ScriptHash should be 20 bytes long!");
    }

    this._emitString(reverseHex(scriptHash));
    return this.emitSysCall(InteropServiceCode.SYSTEM_CONTRACT_CALL);
  }

  /**
   * Appends data depending on type. Used to append params/array lengths.
   * @param data
   * @return this
   */
  public emitPush(data: unknown): this {
    switch (typeof data) {
      case "boolean":
        return this.emit(data ? OpCode.PUSHT : OpCode.PUSHF);
      case "string":
        return this._emitString(data as string);
      case "number":
        return this._emitNum(data as number);
      case "undefined":
        return this.emitPush(false);
      case "object":
        if (Array.isArray(data)) {
          return this._emitArray(data);
        } else if (data === null) {
          return this.emitPush(false);
        } else if (likeContractParam(data)) {
          return this._emitParam(new ContractParam(data));
        }
        throw new Error(`Unidentified object: ${data}`);
      default:
        throw new Error();
    }
  }

  /**
   * Private method to append an array
   * @private
   */
  private _emitArray(arr: unknown[]): this {
    for (let i = arr.length - 1; i >= 0; i--) {
      this.emitPush(arr[i]);
    }
    return this.emitPush(arr.length).emit(OpCode.PACK);
  }

  /**
   * Private method to append a hexstring.
   * @private
   * @param hexstring Hexstring(BE)
   * @return this
   */
  private _emitString(hexstring: string): this {
    ensureHex(hexstring);
    const size = hexstring.length / 2;
    if (size <= 75 /* PUSHBYTES75 */) {
      // this is actually pushing opcode PUSHBYTES1-75, will generate fee.
      this.str += num2hexstring(size);
      this.str += hexstring;
    } else if (size < 0x100) {
      this.emit(OpCode.PUSHDATA1);
      this.str += num2hexstring(size);
      this.str += hexstring;
    } else if (size < 0x10000) {
      this.emit(OpCode.PUSHDATA2);
      this.str += num2hexstring(size, 2, true);
      this.str += hexstring;
    } else if (size < 0x100000000) {
      this.emit(OpCode.PUSHDATA4);
      this.str += num2hexstring(size, 4, true);
      this.str += hexstring;
    } else {
      throw new Error(`String too big to emit!`);
    }
    return this;
  }

  /**
   * Private method to append a number.
   * @private
   * @param num
   * @return this
   */
  private _emitNum(num: number | string): this {
    const bn = new BN(num);
    if (bn.eqn(-1)) {
      return this.emit(OpCode.PUSHM1);
    }
    if (bn.eqn(0)) {
      return this.emit(OpCode.PUSH0);
    }
    if (bn.gtn(0) && bn.lten(16)) {
      return this.emit(
        num2hexstring(81 /* PUSH1 */ - 1 + bn.toNumber()) as OpCode
      );
    }
    const msbSet = bn.testn(bn.byteLength() * 8 - 1);

    const hex = bn
      .toTwos(bn.byteLength() * 8)
      .toString(16, bn.byteLength() * 2);
    const paddedHex = !bn.isNeg() && msbSet ? "00" + hex : hex;

    return this.emitPush(reverseHex(paddedHex));
  }

  /**
   * Private method to append a ContractParam
   * @private
   */
  private _emitParam(param: ContractParam): this {
    if (!param.type) {
      throw new Error("No type available!");
    }
    switch (param.type) {
      case ContractParamType.String:
        return this._emitString(str2hexstring(param.value as string));
      case ContractParamType.Boolean:
        return this.emit(param.value ? OpCode.PUSHT : OpCode.PUSHF);
      case ContractParamType.Integer:
        return this._emitNum(param.value as number);
      case ContractParamType.ByteArray:
        return this._emitString(param.value as string);
      case ContractParamType.Array:
        return this._emitArray(param.value as ContractParam[]);
      case ContractParamType.Hash160:
        return this._emitString(reverseHex(param.value as string));
      case ContractParamType.PublicKey:
        return this._emitString(str2hexstring(param.value as string));
      default:
        throw new Error(`Unaccounted ContractParamType!: ${param.type}`);
    }
  }
}

export default ScriptBuilder;
