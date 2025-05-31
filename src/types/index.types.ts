export type UserType = 'admin' | 'user'

export interface User {
  id: number
  contact: string
  name: string
  email: string | null
  userType: UserType
}

export interface WithId {
  id: string
}

export interface WithName {
  name: string
}

export interface WithCreatedAt {
  createdAt: string
}

export interface WithIdAndName extends WithId, WithName {}

export interface IsEdit {
  isEdit?: boolean
}

export type IsEditRequired = Required<IsEdit>

export interface IsPending {
  isPending: boolean
}

export type PaymentMethod = 'cash' | 'mpesa' | 'cheque' | 'bank'

export interface Form extends WithName {
  id: number
  module: string
  path: string
}

export interface Option {
  value: string
  label: string
}

export type ColorVariant = 'success' | 'warning' | 'error' | 'info'
