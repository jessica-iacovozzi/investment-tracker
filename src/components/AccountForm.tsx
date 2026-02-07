import { useState } from 'react'
import type {
  AccountInput,
  AccountType,
  AccountUpdatePayload,
  CompoundingFrequency,
  ContributionFrequency,
  ContributionTiming,
} from '../types/investment'
import {
  COMPOUNDING_FREQUENCIES,
  COMPOUNDING_FREQUENCY_LABELS,
  CONTRIBUTION_TIMING_LABELS,
} from '../constants/compounding'
import { getFrequencyLabel } from '../utils/projections'
import {
  getDefaultTimingForFrequency,
  getValidTimingsForFrequency,
  normalizeTimingForFrequency,
} from '../utils/contributionTiming'
import {
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  isTaxAdvantagedAccount,
  isLockedAccountType,
} from '../constants/accountTypes'
import { getSharedFieldSeedValues } from '../utils/sharedContributionRoom'
import SharedFieldIndicator from './SharedFieldIndicator'

const DEFAULT_CONTRIBUTION = {
  amount: 200,
  frequency: 'monthly' as ContributionFrequency,
  startMonth: 1,
  endMonth: 12,
}

type AccountFormProps = {
  account: AccountInput
  termYears: number
  onUpdate: (payload: AccountUpdatePayload) => void
  sameTypeAccountCount?: number
  allAccounts?: AccountInput[]
}

type NumericInputs = {
  principal: string
  annualRatePercent: string
  contributionAmount: string
  contributionStartMonth: string
  contributionEndMonth: string
  contributionRoom: string
  annualIncomeForRrsp: string
  fhsaLifetimeContributions: string
  customAnnualRoomIncrease: string
}

const formatNumberInput = (value: number | undefined) =>
  value === undefined ? '' : String(value)

const buildNumericInputs = (input: AccountInput): NumericInputs => ({
  principal: formatNumberInput(input.principal),
  annualRatePercent: formatNumberInput(input.annualRatePercent),
  contributionAmount: formatNumberInput(input.contribution?.amount),
  contributionStartMonth: formatNumberInput(input.contribution?.startMonth),
  contributionEndMonth: formatNumberInput(input.contribution?.endMonth),
  contributionRoom: formatNumberInput(input.contributionRoom),
  annualIncomeForRrsp: formatNumberInput(input.annualIncomeForRrsp),
  fhsaLifetimeContributions: formatNumberInput(input.fhsaLifetimeContributions),
  customAnnualRoomIncrease: formatNumberInput(input.customAnnualRoomIncrease),
})

const buildPayload = (id: string, changes: Partial<AccountInput>) => ({
  id,
  changes,
})

const FREQUENCY_OPTIONS: ContributionFrequency[] = [
  'bi-weekly',
  'monthly',
  'quarterly',
  'annually',
]

const COMPOUNDING_OPTIONS: CompoundingFrequency[] = COMPOUNDING_FREQUENCIES
function AccountForm({ account, termYears, onUpdate, sameTypeAccountCount, allAccounts = [] }: AccountFormProps) {
  const [numericInputs, setNumericInputs] = useState<NumericInputs>(() =>
    buildNumericInputs(account),
  )
  const [editingField, setEditingField] = useState<keyof NumericInputs | null>(null)
  const hasContribution = Boolean(account.contribution)
  const totalMonths = Math.max(Math.round(termYears * 12), 1)
  const contributionFrequency = account.contribution?.frequency ?? 'monthly'
  const normalizedTiming = normalizeTimingForFrequency({
    timing: account.contributionTiming,
    frequency: contributionFrequency,
  })
  const timingOptions = getValidTimingsForFrequency(contributionFrequency)

  const handleSharedFieldFocus = (
    field: keyof NumericInputs,
    accountValue: number | undefined,
  ) => {
    setEditingField(field)
    setNumericInputs((prev) => ({
      ...prev,
      [field]: formatNumberInput(accountValue),
    }))
  }

  const handleSharedFieldBlur = (field: keyof NumericInputs) => {
    setEditingField((prev) => (prev === field ? null : prev))
  }

  const contributionRoomValue =
    editingField === 'contributionRoom'
      ? numericInputs.contributionRoom
      : formatNumberInput(account.contributionRoom)
  const annualIncomeValue =
    editingField === 'annualIncomeForRrsp'
      ? numericInputs.annualIncomeForRrsp
      : formatNumberInput(account.annualIncomeForRrsp)
  const fhsaLifetimeValue =
    editingField === 'fhsaLifetimeContributions'
      ? numericInputs.fhsaLifetimeContributions
      : formatNumberInput(account.fhsaLifetimeContributions)
  const customAnnualRoomValue =
    editingField === 'customAnnualRoomIncrease'
      ? numericInputs.customAnnualRoomIncrease
      : formatNumberInput(account.customAnnualRoomIncrease)

  const handleNameChange = (value: string) => {
    onUpdate(buildPayload(account.id, { name: value }))
  }

  const handleAccountTypeChange = (value: string) => {
    const newAccountType = value as AccountType
    const shouldBeLocked = isLockedAccountType(newAccountType)
    const isTaxAdvantaged = isTaxAdvantagedAccount(newAccountType)

    const changes: Partial<AccountInput> = {
      accountType: newAccountType,
      isLockedIn: shouldBeLocked,
    }

    if (!isTaxAdvantaged) {
      changes.contributionRoom = undefined
      changes.annualIncomeForRrsp = undefined
      changes.fhsaLifetimeContributions = undefined
      changes.customAnnualRoomIncrease = undefined
      setNumericInputs((prev) => ({
        ...prev,
        contributionRoom: '',
        annualIncomeForRrsp: '',
        fhsaLifetimeContributions: '',
        customAnnualRoomIncrease: '',
      }))
    }

    if (newAccountType !== 'rrsp') {
      changes.annualIncomeForRrsp = undefined
      setNumericInputs((prev) => ({ ...prev, annualIncomeForRrsp: '' }))
    }

    if (newAccountType !== 'fhsa') {
      changes.fhsaLifetimeContributions = undefined
      setNumericInputs((prev) => ({ ...prev, fhsaLifetimeContributions: '' }))
    }

    if (newAccountType !== 'tfsa') {
      changes.customAnnualRoomIncrease = undefined
      setNumericInputs((prev) => ({ ...prev, customAnnualRoomIncrease: '' }))
    }

    if (isTaxAdvantaged) {
      const seedValues = getSharedFieldSeedValues(allAccounts, newAccountType, {
        excludeAccountId: account.id,
      })
      Object.assign(changes, seedValues)

      setNumericInputs((prev) => ({
        ...prev,
        contributionRoom:
          seedValues.contributionRoom !== undefined
            ? formatNumberInput(seedValues.contributionRoom)
            : prev.contributionRoom,
        annualIncomeForRrsp:
          seedValues.annualIncomeForRrsp !== undefined
            ? formatNumberInput(seedValues.annualIncomeForRrsp)
            : prev.annualIncomeForRrsp,
        fhsaLifetimeContributions:
          seedValues.fhsaLifetimeContributions !== undefined
            ? formatNumberInput(seedValues.fhsaLifetimeContributions)
            : prev.fhsaLifetimeContributions,
        customAnnualRoomIncrease:
          seedValues.customAnnualRoomIncrease !== undefined
            ? formatNumberInput(seedValues.customAnnualRoomIncrease)
            : prev.customAnnualRoomIncrease,
      }))
    }

    onUpdate(buildPayload(account.id, changes))
  }

  const handleAnnualIncomeChange = (value: string) => {
    handleSharedNumericInputChange({
      field: 'annualIncomeForRrsp',
      value,
      onUpdateField: (nextValue) =>
        onUpdate(buildPayload(account.id, { annualIncomeForRrsp: nextValue })),
    })
  }

  const handleFhsaLifetimeChange = (value: string) => {
    handleSharedNumericInputChange({
      field: 'fhsaLifetimeContributions',
      value,
      onUpdateField: (nextValue) =>
        onUpdate(buildPayload(account.id, { fhsaLifetimeContributions: nextValue })),
    })
  }

  const handleCustomAnnualRoomChange = (value: string) => {
    handleSharedNumericInputChange({
      field: 'customAnnualRoomIncrease',
      value,
      onUpdateField: (nextValue) =>
        onUpdate(buildPayload(account.id, { customAnnualRoomIncrease: nextValue })),
    })
  }

  const handleContributionRoomChange = (value: string) => {
    handleSharedNumericInputChange({
      field: 'contributionRoom',
      value,
      onUpdateField: (nextValue) =>
        onUpdate(buildPayload(account.id, { contributionRoom: nextValue })),
    })
  }

  const handleSharedNumericInputChange = ({
    field,
    value,
    onUpdateField,
  }: {
    field: keyof NumericInputs
    value: string
    onUpdateField: (nextValue: number | undefined) => void
  }) => {
    setNumericInputs((prev) => ({ ...prev, [field]: value }))
    if (value === '') {
      onUpdateField(0)
      return
    }
    const parsed = Number(value)
    if (Number.isNaN(parsed)) {
      return
    }
    onUpdateField(parsed)
  }

  const handleNumericInputChange = ({
    field,
    value,
    onUpdateField,
  }: {
    field: keyof NumericInputs
    value: string
    onUpdateField: (nextValue: number) => void
  }) => {
    setNumericInputs((prev) => ({ ...prev, [field]: value }))
    const parsed = Number(value)
    if (value === '' || Number.isNaN(parsed)) {
      onUpdateField(0)
      return
    }
    onUpdateField(parsed)
  }

  const handlePrincipalChange = (value: string) => {
    handleNumericInputChange({
      field: 'principal',
      value,
      onUpdateField: (nextValue) =>
        onUpdate(buildPayload(account.id, { principal: nextValue })),
    })
  }

  const handleRateChange = (value: string) => {
    handleNumericInputChange({
      field: 'annualRatePercent',
      value,
      onUpdateField: (nextValue) =>
        onUpdate(buildPayload(account.id, { annualRatePercent: nextValue })),
    })
  }

  const handleCompoundingChange = (value: string) => {
    onUpdate(
      buildPayload(account.id, {
        compoundingFrequency: value as CompoundingFrequency,
      }),
    )
  }

  const handleContributionTimingChange = (value: string) => {
    onUpdate(
      buildPayload(account.id, {
        contributionTiming: value as ContributionTiming,
      }),
    )
  }

  const handleContributionToggle = (enabled: boolean) => {
    const nextContribution = enabled
      ? {
          ...DEFAULT_CONTRIBUTION,
          endMonth: totalMonths,
        }
      : undefined
    onUpdate(
      buildPayload(account.id, {
        contribution: nextContribution,
        contributionTiming: enabled
          ? getDefaultTimingForFrequency(DEFAULT_CONTRIBUTION.frequency)
          : account.contributionTiming,
      }),
    )
    setNumericInputs((prev) => ({
      ...prev,
      contributionAmount: enabled
        ? formatNumberInput(nextContribution?.amount)
        : '',
      contributionStartMonth: enabled
        ? formatNumberInput(nextContribution?.startMonth)
        : '',
      contributionEndMonth: enabled
        ? formatNumberInput(nextContribution?.endMonth)
        : '',
    }))
  }

  const handleContributionNumberChange = ({
    field,
    inputField,
    value,
  }: {
    field: 'amount' | 'startMonth' | 'endMonth'
    inputField: keyof NumericInputs
    value: string
  }) => {
    const contribution = account.contribution
    if (!contribution) {
      return
    }

    handleNumericInputChange({
      field: inputField,
      value,
      onUpdateField: (nextValue) => {
        const updatedContribution = {
          ...contribution,
          [field]: nextValue,
        }

        onUpdate(
          buildPayload(account.id, {
            contribution: updatedContribution,
          }),
        )
      },
    })
  }

  const handleContributionChange = (
    field: keyof typeof DEFAULT_CONTRIBUTION,
    value: string,
  ) => {
    if (!account.contribution) {
      return
    }

    if (field === 'frequency') {
      const nextFrequency = value as ContributionFrequency
      const nextTiming = normalizeTimingForFrequency({
        timing: account.contributionTiming,
        frequency: nextFrequency,
      })
      const updatedContribution = {
        ...account.contribution,
        frequency: nextFrequency,
      }

      onUpdate(
        buildPayload(account.id, {
          contribution: updatedContribution,
          contributionTiming: nextTiming,
        }),
      )
      return
    }

    if (field === 'amount') {
      handleContributionNumberChange({
        field,
        inputField: 'contributionAmount',
        value,
      })
      return
    }

    if (field === 'startMonth') {
      handleContributionNumberChange({
        field,
        inputField: 'contributionStartMonth',
        value,
      })
      return
    }

    if (field === 'endMonth') {
      handleContributionNumberChange({
        field,
        inputField: 'contributionEndMonth',
        value,
      })
    }
  }

  return (
    <form className="account-form" aria-label={`${account.name} inputs`}>
      <div className="field-group">
        <label htmlFor={`${account.id}-name`}>Account name</label>
        <input
          id={`${account.id}-name`}
          type="text"
          value={account.name}
          onChange={(event) => handleNameChange(event.target.value)}
        />
      </div>

      <div className="field-group">
        <label htmlFor={`${account.id}-account-type`}>Account type</label>
        <select
          id={`${account.id}-account-type`}
          value={account.accountType}
          onChange={(event) => handleAccountTypeChange(event.target.value)}
        >
          {ACCOUNT_TYPES.map((type) => (
            <option key={type} value={type}>
              {ACCOUNT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      {isTaxAdvantagedAccount(account.accountType) && (
      <div className="field-group">
        <label htmlFor={`${account.id}-contribution-room`} className="field-label--with-info">
          Contribution room ($)
          <span className="field-label__info" title="Available contribution room for tax-advantaged accounts like TFSA, RRSP, or FHSA. Leave empty if not applicable.">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </span>
        </label>
        <input
          id={`${account.id}-contribution-room`}
          type="number"
          min="0"
          step="100"
          placeholder="Optional"
          value={contributionRoomValue}
          onChange={(event) => handleContributionRoomChange(event.target.value)}
          onFocus={() =>
            handleSharedFieldFocus('contributionRoom', account.contributionRoom)
          }
          onBlur={() => handleSharedFieldBlur('contributionRoom')}
          aria-describedby={sameTypeAccountCount && sameTypeAccountCount > 1 ? `${account.id}-contribution-room-shared` : undefined}
        />
        <SharedFieldIndicator
          field="contributionRoom"
          accountType={account.accountType}
          accountCount={sameTypeAccountCount || 1}
          className="field-hint--contribution-room"
          inputId={`${account.id}-contribution-room`}
        />
      </div>
      )}

      {account.accountType === 'rrsp' && (
        <div className="field-group">
          <label htmlFor={`${account.id}-annual-income`} className="field-label--with-info">
            Annual income ($)
            <span className="field-label__info" title="Your annual earned income is used to calculate your RRSP contribution limit (18% of income, up to the annual maximum).">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </span>
          </label>
          <input
            id={`${account.id}-annual-income`}
            type="number"
            min="0"
            step="1000"
            placeholder="Optional"
            value={annualIncomeValue}
            onChange={(event) => handleAnnualIncomeChange(event.target.value)}
            onFocus={() =>
              handleSharedFieldFocus('annualIncomeForRrsp', account.annualIncomeForRrsp)
            }
            onBlur={() => handleSharedFieldBlur('annualIncomeForRrsp')}
            aria-describedby={sameTypeAccountCount && sameTypeAccountCount > 1 ? `${account.id}-annual-income-shared` : undefined}
          />
          <SharedFieldIndicator
            field="annualIncomeForRrsp"
            accountType={account.accountType}
            accountCount={sameTypeAccountCount || 1}
            className="field-hint--annual-income"
            inputId={`${account.id}-annual-income`}
          />
        </div>
      )}

      {account.accountType === 'fhsa' && (
        <div className="field-group">
          <label htmlFor={`${account.id}-fhsa-lifetime`} className="field-label--with-info">
            Lifetime contributions to date ($)
            <span className="field-label__info" title="Total amount you have contributed to your FHSA since opening. The lifetime maximum is $40,000.">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </span>
          </label>
          <input
            id={`${account.id}-fhsa-lifetime`}
            type="number"
            min="0"
            max="40000"
            step="100"
            placeholder="Optional"
            value={fhsaLifetimeValue}
            onChange={(event) => handleFhsaLifetimeChange(event.target.value)}
            onFocus={() =>
              handleSharedFieldFocus(
                'fhsaLifetimeContributions',
                account.fhsaLifetimeContributions,
              )
            }
            onBlur={() => handleSharedFieldBlur('fhsaLifetimeContributions')}
            aria-describedby={sameTypeAccountCount && sameTypeAccountCount > 1 ? `${account.id}-fhsa-lifetime-shared` : undefined}
          />
          <SharedFieldIndicator
            field="fhsaLifetimeContributions"
            accountType={account.accountType}
            accountCount={sameTypeAccountCount || 1}
            className="field-hint--fhsa-lifetime"
            inputId={`${account.id}-fhsa-lifetime`}
          />
        </div>
      )}

      {account.accountType === 'tfsa' && (
        <div className="field-group">
          <label htmlFor={`${account.id}-custom-annual-room`} className="field-label--with-info">
            Custom annual room increase ($)
            <span className="field-label__info" title="Override the default annual TFSA limit ($7,000) if you expect a different indexed amount in future years.">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </span>
          </label>
          <input
            id={`${account.id}-custom-annual-room`}
            type="number"
            min="0"
            step="500"
            placeholder="Default: $7,000"
            value={customAnnualRoomValue}
            onChange={(event) => handleCustomAnnualRoomChange(event.target.value)}
            onFocus={() =>
              handleSharedFieldFocus(
                'customAnnualRoomIncrease',
                account.customAnnualRoomIncrease,
              )
            }
            onBlur={() => handleSharedFieldBlur('customAnnualRoomIncrease')}
            aria-describedby={sameTypeAccountCount && sameTypeAccountCount > 1 ? `${account.id}-custom-annual-room-shared` : undefined}
          />
          <SharedFieldIndicator
            field="customAnnualRoomIncrease"
            accountType={account.accountType}
            accountCount={sameTypeAccountCount || 1}
            className="field-hint--custom-annual-room"
            inputId={`${account.id}-custom-annual-room`}
          />
        </div>
      )}

      <div className="field-row">
        <div className="field-group">
          <label htmlFor={`${account.id}-principal`}>Current invested ($)</label>
          <input
            id={`${account.id}-principal`}
            type="number"
            min="0"
            step="100"
            value={numericInputs.principal}
            onChange={(event) => handlePrincipalChange(event.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor={`${account.id}-rate`}>Annual return (%)</label>
          <input
            id={`${account.id}-rate`}
            type="number"
            min="0"
            step="0.1"
            value={numericInputs.annualRatePercent}
            onChange={(event) => handleRateChange(event.target.value)}
          />
        </div>

        <div className="field-group">
          <label htmlFor={`${account.id}-compounding`}>
            Compounding frequency
          </label>
          <select
            id={`${account.id}-compounding`}
            value={account.compoundingFrequency}
            onChange={(event) => handleCompoundingChange(event.target.value)}
          >
            {COMPOUNDING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {COMPOUNDING_FREQUENCY_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!account.isLockedIn && (
        <div className="field-group field-group--toggle">
          <label htmlFor={`${account.id}-recurring`}>
            Recurring contributions
          </label>
          <input
            id={`${account.id}-recurring`}
            type="checkbox"
            checked={hasContribution}
            onChange={(event) => handleContributionToggle(event.target.checked)}
          />
        </div>
      )}

      {!account.isLockedIn && hasContribution && account.contribution ? (
        <div className="field-row field-row--stack">
          <div className="field-group">
            <label htmlFor={`${account.id}-amount`}>Contribution amount</label>
            <input
              id={`${account.id}-amount`}
              type="number"
              min="0"
              step="50"
              value={numericInputs.contributionAmount}
              onChange={(event) =>
                handleContributionChange('amount', event.target.value)
              }
            />
          </div>

          <div className="field-group">
            <label htmlFor={`${account.id}-frequency`}>Contribution Frequency</label>
            <select
              id={`${account.id}-frequency`}
              value={account.contribution.frequency}
              onChange={(event) =>
                handleContributionChange('frequency', event.target.value)
              }
            >
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {getFrequencyLabel(option)}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group field-group--full">
            <label htmlFor={`${account.id}-timing`} className="field-label--with-info">
              Contribution timing
              <span className="field-label__info" title="Determines whether contributions are added before or after compounding occurs in each period. This affects how much interest your contributions earn.">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </span>
            </label>
            <select
              id={`${account.id}-timing`}
              value={normalizedTiming}
              onChange={(event) =>
                handleContributionTimingChange(event.target.value)
              }
            >
              {timingOptions.map((option) => (
                <option key={option} value={option}>
                  {CONTRIBUTION_TIMING_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

            <div className="field-group">
              <label htmlFor={`${account.id}-start`} className="field-label--with-info">
                Start month (1 - {totalMonths})
                <span className="field-label__info" title="Month the first contribution is applied. Set to 1 to start immediately, or delay by setting a later month.">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </span>
              </label>
              <input
                id={`${account.id}-start`}
                type="number"
                min="1"
                max={totalMonths}
                value={numericInputs.contributionStartMonth}
                onChange={(event) =>
                  handleContributionChange('startMonth', event.target.value)
                }
              />
            </div>

            <div className="field-group">
              <label htmlFor={`${account.id}-end`} className="field-label--with-info">
                End month (1 - {totalMonths})
                <span className="field-label__info" title="Month the last contribution is applied. Set to total months to contribute throughout, or stop earlier by setting a lower month.">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </span>
              </label>
              <input
                id={`${account.id}-end`}
                type="number"
                min="1"
                max={totalMonths}
                value={numericInputs.contributionEndMonth}
                onChange={(event) =>
                  handleContributionChange('endMonth', event.target.value)
                }
              />
          </div>
        </div>
      ) : null}
    </form>
  )
}

export default AccountForm
