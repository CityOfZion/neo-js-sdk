
import semanticApi, * as api from './api'
import * as CONST from './consts'
import semanticSc, * as sc from './sc'
import semanticTx, * as tx from './transactions'
import semanticWallet, * as wallet from './wallet'
import * as u from './utils'

const mods = [semanticSc, semanticTx, semanticWallet, semanticApi]

const Neon = mods.reduce((neon, mod) => {
  Object.keys(mod).map((key) => {
    if (neon[key]) Object.assign(neon[key], mod[key])
    else neon[key] = mod[key]
  })
  return neon
}, { CONST, u })

export default Neon
export {
  api,
  sc,
  tx,
  wallet,
  u,
  CONST
}
