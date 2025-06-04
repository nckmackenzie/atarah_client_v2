import { Link } from '@tanstack/react-router'
import { MoreVertical } from 'lucide-react'
import type { Account } from '@/features/transactions/utils/transactions.types'
import { AdminGuard } from '@/components/custom/admin-guard'
import { EditAction } from '@/components/custom/custom-button'
import CustomDropdownContent from '@/components/custom/custom-dropdown-content'
import { DeletePrompt } from '@/components/custom/delete-prompt'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { deleteAccount } from '@/features/transactions/services/api'

interface AccountsDatatableProps {
  accounts: Array<Account>
}

function AccountsDatatable({ accounts }: AccountsDatatableProps) {
  return (
    <Table className="border rounded-sm">
      <TableHeader>
        <TableRow>
          <TableHead>Account Name</TableHead>
          <TableHead>Account Type</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((acc) => (
          <AccountRow key={acc.id} account={acc} level={0} />
        ))}
      </TableBody>
    </Table>
  )
}

function AccountRow({ account, level }: { account: Account; level: number }) {
  const isMainParent = level === 0 && account.accountType === null
  return (
    <>
      <TableRow
        className={cn('', { 'text-muted-foreground': !account.isActive })}
      >
        <TableCell
          className={cn('row-font', {
            'font-semibold bg-secondary text-secondary-foreground uppercase':
              isMainParent,
          })}
          style={{ paddingLeft: `${(level + 1) * 20}px` }}
          colSpan={isMainParent ? 3 : 0}
        >
          {account.name}
        </TableCell>
        {!isMainParent && (
          <TableCell className="row-font">{account.accountType}</TableCell>
        )}
        {!isMainParent && (
          <TableCell>
            {account.isEditable ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="more-btn">
                      <MoreVertical className="icon-muted" />
                    </button>
                  </DropdownMenuTrigger>
                  <CustomDropdownContent>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/chart-of-accounts/$accountId/edit"
                        params={{ accountId: account.id }}
                      >
                        <EditAction />
                      </Link>
                    </DropdownMenuItem>
                    <AdminGuard>
                      <DeletePrompt
                        description="This action cannot be undone. This will permanently delete the selected account."
                        toastMessage="Account deleted successfully."
                        invalidateKey={['accounts']}
                        action={() => deleteAccount(account.id)}
                      />
                    </AdminGuard>
                  </CustomDropdownContent>
                </DropdownMenu>
              </>
            ) : null}
          </TableCell>
        )}
      </TableRow>
      {account.children.map((child) => (
        <AccountRow key={child.id} account={child} level={level + 1} />
      ))}
    </>
  )
}

export { AccountsDatatable }
