import Transport from "@ledgerhq/hw-transport";
import { u } from "@cityofzion/neon-core";
import {
  StatusWord,
  evalTransportError,
  TransportStatusError,
} from "./ErrorCode";

import { DerToHexSignature } from "./utils";

const DEFAULT_STATUSLIST = [StatusWord.OK];

enum Command {
  GET_APP_NAME = 0x00,
  GET_VERSION = 0x01,
  SIGN_TX = 0x02,
  GET_PUBLIC_KEY = 0x04,
}

/**
 * Helper to send data chunks to sign.
 * @param ledger - Ledger instance
 * @param msg - data up to 510 character
 * @param chunk - data sequence number. Start at 0, increase by 1
 * @param finalChunk - set to true if this is the last chunk for the command
 */
async function sendDataToSign(
  ledger: Transport,
  msg: string,
  chunk: number,
  finalChunk = false
): Promise<Buffer> {
  return await ledger.send(
    0x80,
    Command.SIGN_TX,
    chunk,
    finalChunk ? 0x00 : 0x80,
    Buffer.from(msg, "hex"),
    DEFAULT_STATUSLIST
  );
}

/**
 * Requests the public key of a requested address from the Ledger.
 * @param ledger - Ledger instance
 * @returns the ledger application name. Expected "NEO3"
 */
export async function getAppName(ledger: Transport): Promise<string> {
  try {
    const response = await ledger.send(
      0x80,
      Command.GET_APP_NAME,
      0x00,
      0x00,
      undefined,
      DEFAULT_STATUSLIST
    );
    const version = response.toString("ascii");
    return version.substring(0, version.length - 2); // take of status word
  } catch (e) {
    if (e.statusCode) {
      throw evalTransportError(e as TransportStatusError);
    }
    throw e;
  }
}

/**
 * Requests the public key of a requested address from the Ledger.
 * @param ledger - Ledger instance
 * @returns the application version in Major.Minor.Patch format
 */
export async function getAppVersion(ledger: Transport): Promise<string> {
  try {
    const response = await ledger.send(
      0x80,
      Command.GET_VERSION,
      0x00,
      0x00,
      undefined,
      DEFAULT_STATUSLIST
    );
    const major = response.readUInt8(0);
    const minor = response.readUInt8(1);
    const patch = response.readUInt8(2);
    return major.toString() + "." + minor.toString() + "." + patch.toString();
  } catch (e) {
    if (e.statusCode) {
      throw evalTransportError(e as TransportStatusError);
    }
    throw e;
  }
}

/**
 * Returns the list of connected Ledger devices. Throw if Ledger is not supported by the computer.
 * @param ledgerLibrary - Ledger library
 */
export async function getDevicePaths(
  ledgerLibrary: typeof Transport
): Promise<ReadonlyArray<string>> {
  const supported = await ledgerLibrary.isSupported();
  if (!supported) {
    throw new Error(`Your computer does not support the ledger!`);
  }
  return await ledgerLibrary.list();
}

/**
 * Requests the public key of a requested address from the Ledger.
 * @param ledger - Ledger instance
 * @param bip44String - BIP44 string (40 bytes)
 * @returns An unencoded public key (65 bytes)
 */
export async function getPublicKey(
  ledger: Transport,
  bip44String: string
): Promise<string> {
  try {
    const response = await ledger.send(
      0x80,
      Command.GET_PUBLIC_KEY,
      0x00,
      0x00,
      Buffer.from(bip44String, "hex"),
      DEFAULT_STATUSLIST
    );
    return response.toString("hex").substring(0, 130);
  } catch (e) {
    if (e.statusCode) {
      throw evalTransportError(e as TransportStatusError);
    }
    throw e;
  }
}

/**
 * Requests the device to sign a message using the NEO application.
 * @param ledger - Ledger instance
 * @param payload - message to sign as a hexstring.
 * @param bip44String - BIP44 string (40 bytes)
 * @param networkMagic - MainNet, TestNet or custom network magic
 * @returns Signature as a hexstring (64 bytes)
 */
export async function getSignature(
  ledger: Transport,
  payload: string,
  bip44String: string,
  networkMagic: number
): Promise<string> {
  await sendDataToSign(ledger, bip44String, 0);
  await sendDataToSign(ledger, u.num2hexstring(networkMagic, 4, true), 1);

  const chunks = payload.match(/.{1,510}/g) || [];
  try {
    for (let i = 0; i < chunks.length - 1; i++) {
      await sendDataToSign(ledger, chunks[i], 2 + i);
    }
    const response = await sendDataToSign(
      ledger,
      chunks[chunks.length - 1],
      2 + chunks.length,
      true
    );
    if (response.readUIntBE(0, 2) === StatusWord.OK) {
      throw new Error(`No more data but Ledger did not return signature!`);
    }
    return DerToHexSignature(response.toString("hex"));
  } catch (e) {
    if (e.statusCode) {
      throw evalTransportError(e as TransportStatusError);
    }
    throw e;
  }
}
