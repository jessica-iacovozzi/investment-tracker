export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)

const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 0,
})

export const formatCompactNumber = (value: number) => {
  const sign = value < 0 ? '-' : ''
  const formatted = compactNumberFormatter.format(Math.abs(value))

  return `${sign}$${formatted}`
}
