import { OpCode } from "./OpCode";

export const OpCodePrices = {
  [OpCode.PUSH0]: 30e-8,
  [OpCode.PUSHDATA1]: 180e-8,
  [OpCode.PUSHDATA2]: 13000e-8,
  [OpCode.PUSHDATA4]: 110000e-8,
  [OpCode.PUSHM1]: 30e-8,
  [OpCode.PUSH1]: 30e-8,
  [OpCode.PUSH2]: 30e-8,
  [OpCode.PUSH3]: 30e-8,
  [OpCode.PUSH4]: 30e-8,
  [OpCode.PUSH5]: 30e-8,
  [OpCode.PUSH6]: 30e-8,
  [OpCode.PUSH7]: 30e-8,
  [OpCode.PUSH8]: 30e-8,
  [OpCode.PUSH9]: 30e-8,
  [OpCode.PUSH10]: 30e-8,
  [OpCode.PUSH11]: 30e-8,
  [OpCode.PUSH12]: 30e-8,
  [OpCode.PUSH13]: 30e-8,
  [OpCode.PUSH14]: 30e-8,
  [OpCode.PUSH15]: 30e-8,
  [OpCode.PUSH16]: 30e-8,
  [OpCode.NOP]: 30e-8,
  [OpCode.JMP]: 70e-8,
  [OpCode.JMPIF]: 70e-8,
  [OpCode.JMPIFNOT]: 70e-8,
  [OpCode.CALL]: 22000e-8,
  [OpCode.RET]: 40e-8,
  [OpCode.SYSCALL]: 0,
  [OpCode.XDROP]: 400e-8,
  [OpCode.DEPTH]: 60e-8,
  [OpCode.DROP]: 60e-8,
  [OpCode.DUP]: 60e-8,
  [OpCode.NIP]: 60e-8,
  [OpCode.OVER]: 60e-8,
  [OpCode.PICK]: 60e-8,
  [OpCode.ROLL]: 400e-8,
  [OpCode.ROT]: 60e-8,
  [OpCode.SWAP]: 60e-8,
  [OpCode.TUCK]: 60e-8,
  [OpCode.CAT]: 80000e-8,
  [OpCode.SUBSTR]: 80000e-8,
  [OpCode.LEFT]: 80000e-8,
  [OpCode.RIGHT]: 80000e-8,
  [OpCode.SIZE]: 60e-8,
  [OpCode.INVERT]: 100e-8,
  [OpCode.AND]: 200e-8,
  [OpCode.OR]: 200e-8,
  [OpCode.XOR]: 200e-8,
  [OpCode.EQUAL]: 200e-8,
  [OpCode.INC]: 100e-8,
  [OpCode.DEC]: 100e-8,
  [OpCode.SIGN]: 100e-8,
  [OpCode.NEGATE]: 100e-8,
  [OpCode.ABS]: 100e-8,
  [OpCode.NOT]: 100e-8,
  [OpCode.NZ]: 100e-8,
  [OpCode.ADD]: 200e-8,
  [OpCode.SUB]: 200e-8,
  [OpCode.MUL]: 300e-8,
  [OpCode.DIV]: 300e-8,
  [OpCode.MOD]: 300e-8,
  [OpCode.SHL]: 300e-8,
  [OpCode.SHR]: 300e-8,
  [OpCode.BOOLAND]: 200e-8,
  [OpCode.BOOLOR]: 200e-8,
  [OpCode.NUMEQUAL]: 200e-8,
  [OpCode.NUMNOTEQUAL]: 200e-8,
  [OpCode.LT]: 200e-8,
  [OpCode.GT]: 200e-8,
  [OpCode.MIN]: 200e-8,
  [OpCode.MAX]: 200e-8,
  [OpCode.WITHIN]: 200e-8,
  [OpCode.PACK]: 7000e-8,
  [OpCode.UNPACK]: 7000e-8,
  [OpCode.PICKITEM]: 270000e-8,
  [OpCode.SETITEM]: 270000e-8,
  [OpCode.NEWARRAY]: 15000e-8,
  [OpCode.NEWSTRUCT]: 15000e-8,
  [OpCode.NEWMAP]: 200e-8,
  [OpCode.APPEND]: 15000e-8,
  [OpCode.REMOVE]: 500e-8,
  [OpCode.HASKEY]: 270000e-8,
  [OpCode.KEYS]: 500e-8,
  [OpCode.VALUES]: 7000e-8,
  [OpCode.THROW]: 30e-8,
};
