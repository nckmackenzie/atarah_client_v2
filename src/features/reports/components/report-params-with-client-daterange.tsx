import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import type { UseNavigateResult } from '@tanstack/react-router'
import type { Option } from '@/types/index.types'
import { reportWithClientAndDateRangeSchemaWithRequired } from '@/lib/schema-rules'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { dateFormat } from '@/lib/formatters'
import CustomSelect from '@/components/custom/custom-select'
import { Button } from '@/components/ui/button'

interface ReportParamsWithClientAndDateRangeProps {
  clients: Array<Option>
  clientId?: string
  from?: string
  to?: string
  navigate: UseNavigateResult<'/reports/invoice-status'>
  withAllClients?: boolean
}

export function ReportParamsWithClientAndDateRange({
  clientId,
  from,
  to,
  clients,
  navigate,
  withAllClients = true,
}: ReportParamsWithClientAndDateRangeProps) {
  const form = useForm<
    z.infer<typeof reportWithClientAndDateRangeSchemaWithRequired>
  >({
    defaultValues: {
      clientId: clientId || withAllClients ? 'all' : '',
      from,
      to,
    },
    resolver: zodResolver(reportWithClientAndDateRangeSchemaWithRequired),
  })

  function onSubmit(
    data: z.infer<typeof reportWithClientAndDateRangeSchemaWithRequired>,
  ) {
    navigate({ search: { ...data } })
  }
  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <FormField
            control={form.control}
            name="from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    onChange={field.onChange}
                    value={field.value ? dateFormat(field.value) : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    onChange={field.onChange}
                    value={field.value ? dateFormat(field.value) : ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <FormControl>
                  <CustomSelect
                    defaultValue={field.value}
                    options={
                      withAllClients
                        ? [{ label: 'All Clients', value: 'all' }, ...clients]
                        : clients
                    }
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit">Preview</Button>
      </form>
    </Form>
  )
}
