import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'

import type {
  RoleFormValues,
  SingleRole,
} from '@/features/admin/utils/admin.types'
import { CustomAlert } from '@/components/custom/custom-alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useMutate } from '@/hooks/use-mutate'
import { useError } from '@/hooks/use-error'
import { useFormReset } from '@/hooks/use-form-reset'
import { roleFormSchema } from '@/features/admin/utils/schemas'
import { handleApiErrors, mutationErrorHandler } from '@/lib/error-handlers'
import { successHandler } from '@/lib/utils'
import { createRole, updateRole } from '@/features/admin/services/api'

interface RolesFormProps {
  role?: SingleRole
}
const rowsPerPage = 10

const route = getRouteApi('/_authenticated')
export function RolesForm({ role }: RolesFormProps) {
  const { data: loadedForms } = route.useLoaderData()
  const isEdit = !!role
  const [currentPage, setCurrentPage] = useState(1)
  const form = useForm<RoleFormValues>({
    defaultValues: {
      name: role?.name.toUpperCase() || '',
      rights: role?.rights.map((d) => d.form.id) || [],
      isActive: role?.isActive || true,
    },
    resolver: zodResolver(roleFormSchema),
  })

  const { isPending, mutate } = useMutate(createRole, role?.id, updateRole)
  const { clearErrors, errors, onError } = useError()
  const reset = useFormReset<RoleFormValues>()
  const rights = useWatch({ control: form.control, name: 'rights' })

  const totalPages = Math.ceil(loadedForms.length / rowsPerPage)

  const currentFields = loadedForms.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  )

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const handleCheckboxChange = (formId: number, checked: boolean) => {
    if (!checked) {
      const checkedForms = rights.filter((id) => id !== formId)
      form.setValue('rights', checkedForms)
      return
    }
    form.setValue('rights', [...rights, formId])
  }

  function onSubmit(values: RoleFormValues) {
    clearErrors()
    mutate(values, {
      onError: (err) => {
        if (isAxiosError(err)) {
          if (err.response?.status === 422) {
            handleApiErrors(err.response.data.errors, form.setError)
          } else {
            onError(mutationErrorHandler(err))
          }
        }
      },
      onSuccess: () => {
        successHandler(isEdit, ['roles'], '/roles', 'role')
      },
    })
  }

  return (
    <div className="y-spacing">
      {errors && <CustomAlert description={errors} variant="error" />}
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Role Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Module Name</TableHead>
                  <TableHead>Form Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentFields.map((field) => {
                  const isChecked = rights.includes(field.id)
                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Checkbox
                          checked={isChecked || false}
                          disabled={isPending}
                          onCheckedChange={(state: boolean) => {
                            handleCheckboxChange(field.id, state)
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-xs uppercase">
                        {field.module}
                      </TableCell>
                      <TableCell className="text-xs uppercase">
                        {field.name}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <div className="flex items-center py-4 gap-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isPending}
                type="button"
                size="sm"
              >
                &larr; <span className="inline-block ml-2">Previous</span>
              </Button>
              <Button
                variant="outline"
                type="button"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isPending}
              >
                <span className="inline-block mr-2">Next</span> &rarr;
              </Button>
            </div>
          </>
          <div className="flex items-center justify-end space-x-2">
            <Button type="submit" disabled={isPending}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
            <Button
              type="reset"
              variant="outline"
              disabled={isPending}
              onClick={() => reset(form, clearErrors)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
