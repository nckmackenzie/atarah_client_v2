import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import { DownloadCloudIcon, MailIcon } from 'lucide-react'
import type { InvoiceWithDetails } from '@/features/transactions/utils/transactions.types'
import { invoiceQueryOptions } from '@/features/transactions/services/query-options'
import { ErrorNotification } from '@/components/custom/error-component'
import { FormLoader } from '@/components/custom/loaders'
import { useDocumentTitle } from '@/hooks/use-title'
import { Button } from '@/components/ui/button'
import logo from '@/assets/ATH.png'
import { numberFormat } from '@/lib/formatters'
import { Badge } from '@/components/ui/badge'
import axios from '@/lib/api/axios'

export const Route = createFileRoute(
  '/_authenticated/invoices/$invoiceId/print',
)({
  loader: async ({ context, params: { invoiceId } }) =>
    await context.queryClient.ensureQueryData(
      invoiceQueryOptions.invoice(invoiceId),
    ),
  component: InvoicePrintRouteComponent,
  pendingComponent: () => <FormLoader />,
  errorComponent: ({ error }) => <ErrorNotification message={error.message} />,
})

function InvoicePrintRouteComponent() {
  const { data } = Route.useLoaderData()
  const { invoiceId } = Route.useParams()
  const [isDownloading, setIsDownloading] = useState(false)
  useDocumentTitle(`Print Invoice - ${data.invoiceNo}`)

  async function downloadStatement() {
    setIsDownloading(true)
    try {
      const response = await axios.post(`/api/invoices/${invoiceId}/download`)
      const { downloadUrl, filename } = response.data
      // const fullUrl = new URL(downloadUrl, env.VITE_APP_API_URL).href

      const link = document.createElement('a')
      link.target = '_blank'
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('Invoice downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download statement. Please try again later.')
      console.error('Download error:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-x-2">
        <Button disabled={isDownloading} onClick={downloadStatement}>
          <DownloadCloudIcon />
          <span>Download PDF</span>
        </Button>
        {/* <Button variant="secondary" disabled={isDownloading}>
          <MailIcon />
          <span>Email Invoice</span>
        </Button> */}
      </div>
      <InvoicePrint invoice={data} />
    </div>
  )
}

function InvoicePrint({ invoice }: { invoice: InvoiceWithDetails }) {
  const {
    invoiceNo,
    invoiceDate,
    client,
    dueDate,
    terms,

    vatAmount,
    amountPaid,
    totalAmount,
    discount,
    subTotal,
    details,
  } = invoice
  const balance = parseFloat(totalAmount) - parseFloat(amountPaid || '0')

  const status =
    balance <= 0
      ? 'paid'
      : new Date(dueDate) < new Date()
        ? 'overdue'
        : 'pending'

  return (
    <div className="max-w-4xl mx-auto p-5" id="invoice-content">
      <div className="w-full table mb-8 pb-5 border-b-2 ">
        <div className="table-cell w-3/5 align-top">
          <img
            src={logo}
            alt="Company Logo"
            className="max-w-[150px] h-auto mb-2"
          />
          <div className="text-2xl font-bold text-primary mb-1">
            Atarah Solutions
          </div>
          <div className="text-gray-500 leading-relaxed">
            P.O. Box 35211-00100, Nairobi, Kenya
            <br />
            Phone: +254 721 442 223 | +254 734 442 223
            <br />
            Email: grace@atarahsolutions.co.ke
            <br />
            Website: https://atarahsolutions.co.ke
            <br />
            Pin No: P051802048C
          </div>
        </div>

        <div className="table-cell w-2/5 align-top text-right">
          <div className="text-3xl font-bold text-primary mb-2">INVOICE</div>
          <div className="text-gray-500">Invoice #: {invoiceNo}</div>
          <div className="text-gray-500">
            Date:{' '}
            {new Date(invoiceDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <div className="text-gray-500">Terms: {terms} days</div>
          <div className="text-gray-500">
            Due Date:{' '}
            {new Date(dueDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
          <Badge
            variant={
              status === 'paid'
                ? 'success'
                : status === 'pending'
                  ? 'warning'
                  : 'error'
            }
            className="uppercase"
          >
            {status}
          </Badge>
        </div>
      </div>

      <div className="w-full table mb-8">
        <div className="table-cell w-1/2 align-top pr-5">
          <div className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
            Bill To
          </div>
          <div className="bg-gray-50 p-4 rounded-md border-l-4 border-primary">
            <div className="font-bold mb-1">TO: THE MANAGER,</div>
            <div className="font-bold mb-1">{client.name}</div>
          </div>
        </div>
      </div>

      <table className="w-full mb-8 bg-white rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="w-1/2 p-3 text-left font-semibold text-xs uppercase tracking-wider">
              Service
            </th>
            <th className="w-1/10 p-3 text-center font-semibold text-xs uppercase tracking-wider">
              Qty
            </th>
            <th className="w-3/20 p-3 text-right font-semibold text-xs uppercase tracking-wider">
              Rate
            </th>
            <th className="w-1/10 p-3 text-right font-semibold text-xs uppercase tracking-wider">
              Discount
            </th>
            <th className="w-3/20 p-3 text-right font-semibold text-xs uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {details.map(
            (
              {
                amount,
                discount: itemDiscount,
                id,
                quantity,
                rate,
                service: { name },
              },
              index,
            ) => (
              <tr
                key={id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="p-3 border-b border-gray-200">
                  <div className="font-medium">{name}</div>
                </td>
                <td className="p-3 border-b border-gray-200 text-center">
                  {quantity}
                </td>
                <td className="p-3 border-b border-gray-200 text-right ">
                  {numberFormat(rate)}
                </td>
                <td className="p-3 border-b border-gray-200 text-right">
                  {+itemDiscount > 0 ? `${numberFormat(itemDiscount)}` : '-'}
                </td>
                <td className="p-3 border-b border-gray-200 text-right font-semibold">
                  {numberFormat(amount)}
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>

      <div className="w-full table mt-5">
        <div className="table-cell w-3/5 align-top">notes here</div>
        <div className="table-cell w-2/5 align-top">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="p-2 border-b border-gray-200">
                  <strong>Subtotal:</strong>
                </td>
                <td className="p-2 border-b border-gray-200 text-right font-semibold text-primary">
                  Ksh {numberFormat(subTotal)}
                </td>
              </tr>
              <tr>
                <td className="p-2 border-b border-gray-200">
                  <strong>Total Discount:</strong>
                </td>
                <td className="p-2 border-b border-gray-200 text-right">
                  -Ksh {numberFormat(discount)}
                </td>
              </tr>
              <tr>
                <td className="p-2 border-b border-gray-200">
                  <strong>VAT ({invoice.vat}%):</strong>
                </td>
                <td className="p-2 border-b border-gray-200 text-right font-semibold text-primary">
                  Ksh {numberFormat(vatAmount)}
                </td>
              </tr>
              <tr className="bg-blue-900 text-white">
                <td className="p-2">
                  <strong>Total Amount:</strong>
                </td>
                <td className="p-2 text-right">
                  <strong>Ksh {numberFormat(totalAmount)}</strong>
                </td>
              </tr>
              {amountPaid && +amountPaid > 0 && (
                <>
                  <tr>
                    <td className="p-2 border-b border-gray-200">
                      <strong>Amount Paid:</strong>
                    </td>
                    <td className="p-2 border-b border-gray-200 text-right">
                      -Ksh {numberFormat(amountPaid)}
                    </td>
                  </tr>
                  <tr className="bg-blue-900 text-white">
                    <td className="p-2">
                      <strong>Balance Due:</strong>
                    </td>
                    <td className="p-2 text-right">
                      <strong>
                        Ksh{' '}
                        {numberFormat(
                          parseFloat(totalAmount) - parseFloat(amountPaid),
                        )}
                      </strong>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 p-5 rounded-md border-l-4 border-blue-400 mt-5">
        <div className="text-sm font-bold text-primary mb-2">
          Payment Information
        </div>
        <div>
          <strong>Payment Terms:</strong> Net {invoice.terms} days
          <br />
          <strong>Make payments to:</strong> Atarah Solutions Limited
          <br />
          <strong>ACCOUNT NO:</strong> 01192952546400
          <br />
          <strong>Bank Name:</strong> CO-OPERATIVE BANK
          <br />
          <strong>BRANCH:</strong> ENTERPRISE ROAD
        </div>
      </div>

      <div className="mt-10 pt-5 border-t border-gray-200 text-center text-gray-500 text-xs">
        <div>Thank you for your business!</div>
        <div>
          If you have any questions regarding this invoice, please contact us at
          grace@atarahsolutions.co.ke
        </div>
        <div className="mt-1">
          This invoice was generated on{' '}
          {new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  )
}
