export enum StatusWord {
  OK = 0x9000,
  DENY = 0x6985,
  WRONG_P1P2 = 0x6a86,
  WRONG_DATA_LENGTH = 0x6a87,
  INS_NOT_SUPPORTED = 0x6d00,
  CLA_NOT_SUPPORTED = 0x6e00,
  WRONG_RESPONSE_LENGTH = 0xb000,
  DISPLAY_BIP32_PATH_FAIL = 0xb001,
  DISPLAY_ADDRESS_FAIL = 0xb002,
  DISPLAY_AMOUNT_FAIL = 0xb003,
  WRONG_TX_LENGTH = 0xb004,
  TX_PARSING_FAIL = 0xb005,
  TX_USER_CONFIRMATION_FAIL = 0xb006,
  TX_HASH_FAIL = 0xb007,
  BAD_STATE = 0xb008,
  SIGN_FAIL = 0xb009,
  BIP44_BAD_PURPOSE = 0xb100,
  BIP44_BAD_COIN_TYPE = 0xb101,
  BIP44_ACCOUNT_NOT_HARDENED = 0xb102,
  BIP44_BAD_ACCOUNT = 0xb103,
  BIP44_BAD_CHANGE = 0xb104,
  BIP44_BAD_ADDRESS = 0xb105,
  MAGIC_PARSING_FAIL = 0xb106,
  DISPLAY_SYSTEM_FEE_FAIL = 0xb107,
  DISPLAY_NETWORK_FEE_FAIL = 0xb108,
}

export interface TransportStatusError extends Error {
  name: "TransportStatusError";
  message: string;
  stack: Error["stack"];
  statusCode: number;
  statusText: string;
}

/**
 * Evaluates Transport Error thrown and rewrite the error message to be more user friendly.
 * @returns error with modified message if found.
 */
export function evalTransportError(err: Error): Error {
  const transportErr = err as TransportStatusError;
  switch (transportErr.statusCode) {
    case StatusWord.DENY:
      transportErr.message = "Action rejected by user";
      break;
    case StatusWord.WRONG_P1P2:
      transportErr.message = "Incorrect P1 or P2 in APDU";
      break;
    case StatusWord.TX_USER_CONFIRMATION_FAIL:
      transportErr.message = "Transaction signing denied";
      break;
    default:
      transportErr.message = `Unknown status 0x${transportErr.statusCode.toString(
        16
      )}`;
  }
  return err;
}

export default StatusWord;
