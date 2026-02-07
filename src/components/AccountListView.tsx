import { useState } from 'react'
import type { AccountInput, AccountUpdatePayload } from '../types/investment'
import type { InflationState } from '../types/inflation'
import AccountListRow from './AccountListRow'

type AccountListViewProps = {
  accounts: AccountInput[]
  allAccounts: AccountInput[]
  termYears: number
  currentAge?: number
  inflationState: InflationState
  onUpdate: (payload: AccountUpdatePayload) => void
  onDelete: (id: string) => void
}

/**
 * Container that renders accounts as a single-column stack of compact rows.
 * Manages accordion state: only one row can be expanded at a time.
 */
function AccountListView({
  accounts,
  allAccounts,
  termYears,
  currentAge,
  inflationState,
  onUpdate,
  onDelete,
}: AccountListViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="account-list" role="tabpanel" aria-label="List view">
      {accounts.map((account) => (
        <AccountListRow
          key={account.id}
          account={account}
          allAccounts={allAccounts}
          termYears={termYears}
          currentAge={currentAge}
          inflationState={inflationState}
          isExpanded={expandedId === account.id}
          onToggle={handleToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default AccountListView
