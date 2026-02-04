import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ProjectionPoint } from '../types/investment'
import { formatCompactNumber, formatCurrency, formatNumber } from '../utils/formatters'

type AccountChartProps = {
  data: ProjectionPoint[]
  inflationEnabled?: boolean
}

const MAX_YEAR_TICK_SEGMENTS = 6

const formatYearTick = (value: number) => `${Math.round(value)}y`

const getYearTicks = (points: ProjectionPoint[]) => {
  if (points.length === 0) {
    return []
  }

  const minYear = points.reduce((min, point) => Math.min(min, point.year), points[0].year)
  const maxYear = points.reduce((max, point) => Math.max(max, point.year), points[0].year)
  const step = Math.max(1, Math.round((maxYear - minYear) / MAX_YEAR_TICK_SEGMENTS))
  const ticks: number[] = []

  for (let year = minYear; year <= maxYear; year += step) {
    ticks.push(year)
  }

  if (ticks[ticks.length - 1] !== maxYear) {
    ticks.push(maxYear)
  }

  return ticks
}

function AccountChart({ data, inflationEnabled }: AccountChartProps) {
  return (
    <section className="chart-card" aria-label="Projection chart">
      <h3 className="chart-card__title">Growth projection</h3>
      <div className="chart-card__body" role="img" aria-label="Line chart">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255, 255, 255, 0.15)" />
            <XAxis
              dataKey="year"
              tickFormatter={formatYearTick}
              ticks={getYearTicks(data)}
              stroke="rgba(255, 255, 255, 0.7)"
              tickMargin={8}
            />
            <YAxis
              tickFormatter={formatCompactNumber}
              width={70}
              stroke="rgba(255, 255, 255, 0.7)"
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(label) => `Year ${formatNumber(Number(label))}`}
              contentStyle={{
                background: '#111a2a',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 12,
              }}
              itemStyle={{ color: '#f5f5f5' }}
            />
            <Legend verticalAlign="top" />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#fbbf24"
              strokeWidth={2.5}
              dot={false}
              name="Projected balance"
            />
            <Line
              type="monotone"
              dataKey="totalContributions"
              stroke="#7dd3fc"
              strokeWidth={2}
              dot={false}
              name="Total contributions"
            />
            {inflationEnabled && (
              <Line
                type="monotone"
                dataKey="realBalance"
                stroke="#4ade80"
                strokeWidth={2}
                dot={false}
                name="Real balance (today's $)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default AccountChart
