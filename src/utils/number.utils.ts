export const roundToMaxDecimals = (value?: number, maxPrecision = 0.1): string => {
  if (value === undefined || value === null || Number.isNaN(value as any)) return ''

  const log = Math.log10(maxPrecision)
  const decimals = log < 0 ? Math.round(-log) : 0

  const factor = Math.pow(10, decimals)
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor

  let out = rounded.toFixed(decimals)

  if (Number.isInteger(value)) {
    out = Math.trunc(value).toString()
  }

  return out
}
