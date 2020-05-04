import { str2hexstring, sha256, hash160, int2hex, reverseHex } from "../u";
import { OpCode } from "./OpCode";

export enum InteropServiceCode {
  NEO_CRYPTO_ECDSACHECKMULTISIG = "3073b3bb",
  NEO_CRYPTO_ECDSAVERIFY = "0a906ad4",
  NEO_NATIVE_DEPLOY = "123e7fe8",
  SYSTEM_BINARY_DESERIALIZE = "527cd0df",
  SYSTEM_BINARY_SERIALIZE = "3f1c0124",
  SYSTEM_BLOCKCHAIN_GETBLOCK = "8347922d",
  SYSTEM_BLOCKCHAIN_GETCONTRACT = "a9c54b41",
  SYSTEM_BLOCKCHAIN_GETHEIGHT = "7ef5721f",
  SYSTEM_BLOCKCHAIN_GETTRANSACTION = "e6558d48",
  SYSTEM_BLOCKCHAIN_GETTRANSACTIONFROMBLOCK = "7e56fd69",
  SYSTEM_BLOCKCHAIN_GETTRANSACTIONHEIGHT = "4a3288b1",
  SYSTEM_CONTRACT_CALL = "627d5b52",
  SYSTEM_CONTRACT_CALLEX = "eef40cdb",
  SYSTEM_CONTRACT_CREATE = "ce352c85",
  SYSTEM_CONTRACT_CREATESTANDARDACCOUNT = "cf998702",
  SYSTEM_CONTRACT_DESTROY = "c69f1df0",
  SYSTEM_CONTRACT_GETCALLFLAGS = "95da3a81",
  SYSTEM_CONTRACT_ISSTANDARD = "d76b9d85",
  SYSTEM_CONTRACT_UPDATE = "31c6331d",
  SYSTEM_ENUMERATOR_CONCAT = "d406e5e1",
  SYSTEM_ENUMERATOR_CREATE = "bbaa607a",
  SYSTEM_ENUMERATOR_NEXT = "926d4cf0",
  SYSTEM_ENUMERATOR_VALUE = "bd20202c",
  SYSTEM_ITERATOR_CONCAT = "e5870a81",
  SYSTEM_ITERATOR_CREATE = "ed64f727",
  SYSTEM_ITERATOR_KEY = "0e9488ba",
  SYSTEM_ITERATOR_KEYS = "fd9096e9",
  SYSTEM_ITERATOR_VALUES = "beee30ad",
  SYSTEM_JSON_DESERIALIZE = "a79c470e",
  SYSTEM_JSON_SERIALIZE = "248d264b",
  SYSTEM_RUNTIME_CHECKWITNESS = "f827ec8c",
  SYSTEM_RUNTIME_GASLEFT = "1488d8ce",
  SYSTEM_RUNTIME_GETCALLINGSCRIPTHASH = "39536e3c",
  SYSTEM_RUNTIME_GETENTRYSCRIPTHASH = "f9b4e238",
  SYSTEM_RUNTIME_GETEXECUTINGSCRIPTHASH = "dbfea874",
  SYSTEM_RUNTIME_GETINVOCATIONCOUNTER = "84271143",
  SYSTEM_RUNTIME_GETNOTIFICATIONS = "274335f1",
  SYSTEM_RUNTIME_GETSCRIPTCONTAINER = "2d510830",
  SYSTEM_RUNTIME_GETTIME = "b7c38803",
  SYSTEM_RUNTIME_GETTRIGGER = "e97d38a0",
  SYSTEM_RUNTIME_LOG = "cfe74796",
  SYSTEM_RUNTIME_NOTIFY = "95016f61",
  SYSTEM_RUNTIME_PLATFORM = "b279fcf6",
  SYSTEM_STORAGE_ASREADONLY = "764cbfe9",
  SYSTEM_STORAGE_DELETE = "2f58c5ed",
  SYSTEM_STORAGE_FIND = "df30b89a",
  SYSTEM_STORAGE_GET = "925de831",
  SYSTEM_STORAGE_GETCONTEXT = "9bf667ce",
  SYSTEM_STORAGE_GETREADONLYCONTEXT = "f6b46be2",
  SYSTEM_STORAGE_PUT = "e63f1884",
  SYSTEM_STORAGE_PUTEX = "73e19b3a"
}

export default InteropServiceCode;

export function generateInteropServiceCode(methodName: string): string {
  const hexMethodName = str2hexstring(methodName);
  return sha256(hexMethodName).slice(0, 8);
}

export function fromMethodName(methodName: string): InteropServiceCode {
  const enumName = methodName.toUpperCase().replace(".", "_");
  if (enumName in InteropServiceCode) {
    return InteropServiceCode[enumName as keyof typeof InteropServiceCode];
  }
  throw new Error("Method name not found in InteropServiceCode!");
}

export function getContractHash(contractName: string): string {
  const interopHash = generateInteropServiceCode(contractName);
  return reverseHex(hash160(int2hex(OpCode.SYSCALL) + interopHash));
}
