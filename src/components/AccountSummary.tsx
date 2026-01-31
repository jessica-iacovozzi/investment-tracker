import type { ProjectionTotals } from '../types/investment'
import { getFinalAgeLabel } from '../utils/ageLabel'
import { formatCurrency } from '../utils/formatters'

type AccountSummaryProps = {
  totals: ProjectionTotals
  currentAge?: number
  termYears: number
}

function AccountSummary({ totals, currentAge, termYears }: AccountSummaryProps) {
  const finalValueLabel = getFinalAgeLabel({ currentAge, termYears })
  const items = [
    {
      label: 'Total contributions',
      value: formatCurrency(totals.totalContributions),
    },
    {
      label: 'Total returns',
      value: formatCurrency(totals.totalReturns),
    },
    {
      label: finalValueLabel,
      value: formatCurrency(totals.finalBalance),
    },
  ]

  return (
    <section className="summary-card" aria-label="Projection summary">
      <h3 className="summary-card__title">Projection summary</h3>
      <dl className="summary-card__list">
        {items.map((item) => (
          <div key={item.label} className="summary-card__item">
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default AccountSummary
