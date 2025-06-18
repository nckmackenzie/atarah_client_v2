export type DashboardStats = {
  totalRevenue: string
  totalExpenses: string
  pendingInvoices: string
  netProfit: string
}

export type TopClient = {
  id: string
  name: string
  invoices: number
  revenue: string
}
