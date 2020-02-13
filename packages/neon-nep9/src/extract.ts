import { CONST, tx, u } from "@cityofzion/neon-core";

const requiresProcessing = [
  tx.TxAttrUsage.Description,
  tx.TxAttrUsage.DescriptionUrl,
  tx.TxAttrUsage.Remark,
  tx.TxAttrUsage.Remark2,
  tx.TxAttrUsage.Remark3,
  tx.TxAttrUsage.Remark4,
  tx.TxAttrUsage.Remark5,
  tx.TxAttrUsage.Remark6,
  tx.TxAttrUsage.Remark7,
  tx.TxAttrUsage.Remark8,
  tx.TxAttrUsage.Remark9,
  tx.TxAttrUsage.Remark10,
  tx.TxAttrUsage.Remark11,
  tx.TxAttrUsage.Remark12,
  tx.TxAttrUsage.Remark13,
  tx.TxAttrUsage.Remark14,
  tx.TxAttrUsage.Remark15
];

export function extractAsset(params: {
  [key: string]: string;
}): string | undefined {
  if (!params.asset) {
    return undefined;
  }
  switch (params.asset) {
    case "neo":
      return CONST.ASSET_ID.NEO;
    case "gas":
      return CONST.ASSET_ID.GAS;
    default:
      return params.asset;
  }
}

export function extractAmount(params: {
  [key: string]: string;
}): number | undefined {
  if (!params.amount) {
    return undefined;
  }
  return parseFloat(params.amount);
}

function processAscii(data: string): string {
  return u.str2hexstring(decodeURIComponent(data));
}

function matchAttribute(
  key: string,
  data: string
): tx.TransactionAttributeLike | undefined {
  const camelCasedKey = key.replace(/^[a-z]/, c => c.toUpperCase());
  if (camelCasedKey in tx.TxAttrUsage) {
    const usage = tx.TxAttrUsage[camelCasedKey as keyof typeof tx.TxAttrUsage];
    return {
      usage,
      data: requiresProcessing.indexOf(usage) >= 0 ? processAscii(data) : data
    };
  }
  switch (key) {
    case "ecdh02":
      return {
        usage: tx.TxAttrUsage.ECDH02,
        data
      };
    case "ecdh03":
      return {
        usage: tx.TxAttrUsage.ECDH03,
        data
      };
    default:
      return undefined;
  }
}

export function extractAttributes(params: {
  [key: string]: string;
}): tx.TransactionAttribute[] {
  const attributes = Object.keys(params).map(key =>
    matchAttribute(key, params[key])
  );
  return attributes.filter(a => a) as tx.TransactionAttribute[];
}
