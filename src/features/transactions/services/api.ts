import type {
  AccountFormValues,
  ExpenseFormValues,
  InvoiceFormValues,
  InvoicePaymentBulkFormValues,
  InvoicePaymentFormValues,
  JournalEntry,
  JournalFormValues,
} from '@/features/transactions/utils/transactions.types'
import axios from '@/lib/api/axios'
import { mutationErrorHandler } from '@/lib/error-handlers'
import { dateFormat } from '@/lib/formatters'
import { createResource, deleteResource, updateResource } from '@/lib/utils'

export async function createAccount(values: AccountFormValues) {
  await createResource('accounts', values)
}

export async function updateAccount(id: string, values: AccountFormValues) {
  await updateResource(`accounts`, id.toString(), values)
}
export async function deleteAccount(id: string) {
  await deleteResource('accounts', id)
}

export async function createInvoice(values: InvoiceFormValues) {
  await createResource('invoices', values)
}

export async function updateInvoice(id: string, values: InvoiceFormValues) {
  await updateResource(`invoices`, id.toString(), values)
}
export async function deleteInvoice(id: string) {
  await deleteResource('invoices', id)
}

export async function createPayment(
  invoiceId: string,
  values: InvoicePaymentFormValues,
) {
  await axios.post(`/api/invoices/${invoiceId}/payments`, values)
}

export async function createBulkPayment(values: InvoicePaymentBulkFormValues) {
  await axios.post('/api/invoices/payments', values)
}

export async function updateInvoicePayment(
  paymentId: string,
  values: InvoicePaymentFormValues,
) {
  await updateResource(`invoices/payments`, paymentId.toString(), values)
}

function formatExpenseFormData(
  data: ExpenseFormValues & { attachmentsToDelete: Array<number> },
) {
  const formData = new FormData()
  formData.append('expense_date', dateFormat(data.expenseDate))
  formData.append('payee', data.payee)
  formData.append('payment_method', data.paymentMethod)
  formData.append('payment_reference', data.paymentReference)

  data.details.forEach((detail, index) => {
    formData.append(`details[${index}][gl_account_id]`, detail.glAccountId)
    formData.append(`details[${index}][project_id]`, detail.projectId || '')
    formData.append(`details[${index}][amount]`, detail.amount.toString())
    formData.append(`details[${index}][description]`, detail.description || '')
  })

  data.attachmentsToDelete.forEach((id) => {
    formData.append('attachmentsToDelete[]', id.toString())
  })

  data.attachments?.forEach((file, index) => {
    formData.append(`attachments[${index}]`, file)
  })

  return formData
}

export async function createExpense(
  data: ExpenseFormValues & { attachmentsToDelete: Array<number> },
) {
  await axios.post('/api/expenses', formatExpenseFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function updateExpense(
  id: string,
  data: ExpenseFormValues & { attachmentsToDelete: Array<number> },
) {
  const formData = formatExpenseFormData(data)

  formData.append('_method', 'PATCH')

  await axios.post(`/api/expenses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function deleteExpense(id: string) {
  await deleteResource('expenses', id)
}

export async function fetchJournalNo(): Promise<{ data: number }> {
  try {
    const { data } = await axios(`/api/journal-entries/get-no`)
    return data
  } catch (error) {
    console.log(error)
    throw new Error('Unable to fetch journal no')
  }
}

export async function createEntry(
  data: JournalFormValues,
  transactionId?: string,
) {
  if (transactionId) {
    await axios.patch(`/api/journal-entries/${transactionId}`, data)
  } else {
    await axios.post(`/api/journal-entries`, data)
  }
}

export async function fetchJournal(
  journalNo: string,
): Promise<{ data: JournalEntry }> {
  try {
    const { data } = await axios(`/api/journal-entries/${journalNo}`)
    return data
  } catch (error) {
    const err = mutationErrorHandler(error)
    throw new Error(err)
  }
}

export async function deleteEntry(transactionId: string) {
  try {
    await axios.delete(`/api/journal-entries/${transactionId}`)
  } catch (error) {
    const err = mutationErrorHandler(error)
    throw new Error(err)
  }
}
