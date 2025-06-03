import { Link, getRouteApi } from '@tanstack/react-router'
import { createAvatar } from '@dicebear/core'
import { initials } from '@dicebear/collection'
import {
  DollarSign,
  FileChartColumn,
  Lock,
  LogOut,
  Minus,
  Plus,
  ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { Form, TRoutes } from '@/types/index.types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import logoMain from '@/assets/ATH.png'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/use-auth'

import { getInitials } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface FormattedArray {
  title: string
  url: string
  icon: LucideIcon
  items: Array<{
    title: string
    url: string
  }>
}

const icons = {
  admin: ShieldCheck,
  transactions: DollarSign,
  reports: FileChartColumn,
} as const

type IconKeys = keyof typeof icons

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

const route = getRouteApi('/_authenticated')

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { logout } = useAuth()
  const { data } = route.useLoaderData()

  const { open } = useSidebar()
  return (
    <Sidebar collapsible="icon" {...props} variant="sidebar">
      <SidebarHeader className="h-16 flex  justify-center">
        <Logo className={`${!open ? 'hidden' : ''}`} />
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <Navigation forms={data} />
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn('', {
              'w-full border rounded-md p-2': open,
            })}
          >
            <div className="flex items-center justify-between ">
              <UserAvatar />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 [&>*]:cursor-pointer">
            {/* TODO: CHANGE PASSWORD FUNCTIONALITY */}
            <DropdownMenuItem>
              <Lock className="icon" />
              <span>Change Passsword</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="icon text-destructive" />
              <span className="text-destructive">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/dashboard"
      className={cn(
        'flex items-center justify-center gap-2 text-lg font-semibold',
        className,
      )}
    >
      <img src={logoMain} alt="Atarah Logo" className="h-12" />
      {/* <span className="hidden md:inline">My App</span> */}
    </Link>
  )
}

function UserAvatar() {
  const { user } = useAuth()
  const { open } = useSidebar()
  if (!user) return null
  const avatar = createAvatar(initials, {
    seed: user.name,
    fontWeight: 500,
    fontSize: 42,
  })

  const svg = avatar.toDataUri()

  return (
    <div className="flex items-center">
      <Avatar className={cn({ 'size-10': open, 'size-8': !open })}>
        <AvatarImage src={svg} alt={user.name} />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      {open && (
        <div className="ml-2 flex flex-col">
          <p className="text-sm font-medium text-accent-foreground w-max">
            {user.name || 'User'}
          </p>
          <p className="text-xs text-secondary-foreground">{user.email}</p>
        </div>
      )}
    </div>
  )
}

function Navigation({ forms }: { forms: Array<Form> }) {
  const groupedModules = forms.reduce<
    Record<string, Array<{ title: string; url: string }>>
  >((acc, curr) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!acc[curr.module]) {
      acc[curr.module] = []
    }
    acc[curr.module].push({ title: curr.name, url: curr.path })
    return acc
  }, {})

  function isIconKey(module: string): module is IconKeys {
    return module in icons
  }

  const formattedArray: Array<FormattedArray> = Object.entries(
    groupedModules,
  ).map(([module, items]) => ({
    title: module,
    url: '#',
    icon: isIconKey(module) ? icons[module] : ShieldCheck,
    items,
  }))
  return (
    <SidebarGroup>
      <SidebarMenu>
        {formattedArray.map((item) => (
          <Collapsible key={item.title} asChild className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="capitalize" tooltip={item.title}>
                  {<item.icon />}
                  <span>{item.title}</span>
                  <Plus className="ml-auto icon text-muted-foreground group-data-[state=open]/collapsible:hidden" />
                  <Minus className="hidden ml-auto icon text-muted-foreground group-data-[state=open]/collapsible:block" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        className="text-xs font-medium text-muted-foreground"
                      >
                        <Link to={`/${subItem.url}` as TRoutes}>
                          {subItem.title}
                        </Link>
                        {/* <button
                          onClick={() =>
                            router.navigate({ to: `/${subItem.url}` })
                          }
                          className="w-full text-left"
                        >
                          <span className="capitalize">{subItem.title}</span>
                        </button> */}
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
