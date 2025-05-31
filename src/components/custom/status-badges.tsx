import {
  Banknote,
  CheckCircle2,
  CircleX,
  CreditCard,
  Landmark,
  TriangleAlert,
} from 'lucide-react'

import type { PaymentMethod } from '@/types/index.types'
import { Badge } from '@/components/ui/badge'

import { cn } from '@/lib/utils'

interface CustomStatusBadgeProps {
  text: string
  variant: 'success' | 'warning' | 'error' | 'info'
}

export function CustomStatusBadge({ text, variant }: CustomStatusBadgeProps) {
  return (
    <Badge variant={variant} className="inline-flex gap-1 px-0.5 capitalize">
      {variant === 'success' ? (
        <CheckCircle2 size={14} />
      ) : variant === 'error' ? (
        <CircleX size={14} />
      ) : (
        <TriangleAlert size={14} />
      )}
      <span>{text}</span>
    </Badge>
  )
}

export function PaymentMethodBadges({
  method,
}: {
  method: PaymentMethod | 'transfer_out' | 'transfer_in'
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-200 border-green-200 dark:border-green-800 uppercase',
        {
          'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-200 border-rose-200 dark:border-rose-800':
            method === 'transfer_out',
        },
      )}
    >
      {method === 'cash' ? (
        <Banknote className="h-3 w-3 mr-1" />
      ) : method === 'cheque' ? (
        <CreditCard className="h-3 w-3 mr-1" />
      ) : method === 'bank' ? (
        <Landmark className="h-3 w-3 mr-1" />
      ) : null}
      {method !== 'mpesa' ? (
        method
      ) : (
        <>
          <MpesaIcon className="h-3 w-3 -mx-0.5" />
          <span className="text-xs">MPESA</span>
        </>
      )}
    </Badge>
  )
}

function MpesaIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="48px"
      height="48px"
      fill-rule="evenodd"
      clip-rule="evenodd"
      baseProfile="basic"
    >
      <path
        fill="#aed580"
        d="M31.003,7.001l-0.001-5.5c0-0.828,0.672-1.5,1.5-1.5	c0.828,0,1.5,0.672,1.5,1.5v5.5H31.003z"
      />
      <path
        fill="#aed580"
        d="M14.964,47.999h18.073c0.533,0,0.965-0.432,0.965-0.965V4.964c0-0.533-0.432-0.965-0.965-0.965	H14.964c-0.533,0-0.965,0.432-0.965,0.965v42.07C13.999,47.567,14.431,47.999,14.964,47.999z"
      />
      <path
        fill="#fff"
        fill-rule="evenodd"
        d="M17.739,29.001h12.524c0.962,0,1.741-0.78,1.741-1.741V10.743	c0-0.962-0.78-1.741-1.741-1.741H17.739c-0.962,0-1.741,0.78-1.741,1.741V27.26C15.997,28.222,16.777,29.001,17.739,29.001z"
        clip-rule="evenodd"
      />
      <path
        fill="#9b2310"
        fill-rule="evenodd"
        d="M12.001,22.001	c3.643-0.7,5.865-2.448,7-5c1.135,2.552,3.357,4.3,7,5H12.001z"
        clip-rule="evenodd"
      />
      <path
        fill="#e60023"
        fill-rule="evenodd"
        d="M12.001,22.001	c4.273,0.867,6.476,1,11,1c5.076,0,11.712-1.939,14-6l-9-4C24.039,18.139,21.863,22.001,12.001,22.001z"
        clip-rule="evenodd"
      />
    </svg>
  )
}
