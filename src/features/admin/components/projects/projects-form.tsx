import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type {
  Project,
  ProjectFormValues,
} from '@/features/admin/utils/admin.types'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CustomAlert } from '@/components/custom/custom-alert'

import { projectFormSchema } from '@/features/admin/utils/schemas'
import { useError } from '@/hooks/use-error'
import { useMutate } from '@/hooks/use-mutate'
import { useFormReset } from '@/hooks/use-form-reset'
import { createProject, updateProject } from '@/features/admin/services/api'
import FormActions from '@/components/custom/form.actions'
import { formErrorHandler } from '@/lib/error-handlers'
import { successHandler } from '@/lib/utils'

interface ProjectFormProps {
  project?: Project
}

export function ProjectForm({ project }: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    defaultValues: {
      active: project?.active || true,
      description: project?.description?.toUpperCase() || '',
      name: project?.name.toUpperCase() || '',
    },
    resolver: zodResolver(projectFormSchema),
  })
  const { clearErrors, errors, onError } = useError()
  const reset = useFormReset<ProjectFormValues>()
  const { isPending, mutate } = useMutate(
    createProject,
    project?.id,
    updateProject,
  )
  const isEdit = !!project

  function onSubmit(values: ProjectFormValues) {
    clearErrors()
    mutate(values, {
      onError: (error) => formErrorHandler(error, form.setError, onError),
      onSuccess: () =>
        successHandler(isEdit, ['projects'], '/projects', 'project'),
    })
  }
  return (
    <div className="space-y-4">
      {errors && <CustomAlert variant="error" description={errors} />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    {...field}
                    placeholder="Enter project name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    disabled={isPending}
                    {...field}
                    placeholder="Enter description...optional"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isEdit && (
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        disabled={isPending}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <Label htmlFor="airplane-mode">
                      {form.watch('active') ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                </FormItem>
              )}
            />
          )}
          <FormActions
            isPending={isPending}
            resetFn={() => reset(form, clearErrors)}
            isEdit={isEdit}
          />
        </form>
      </Form>
    </div>
  )
}
