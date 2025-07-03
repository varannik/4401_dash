'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
  Bars3Icon,
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/radix/dropdown-menu'
import DashBackground from './dashBackground'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Team', href: '/dashboard/team', icon: UsersIcon },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartPieIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: DocumentDuplicateIcon },
]

const teams = [
  { id: 1, name: '44.01 Core', href: '#', initial: '4' },
  { id: 2, name: 'Engineering', href: '#', initial: 'E' },
  { id: 3, name: 'Monitoring', href: '#', initial: 'M' },
]

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const isCurrentPage = (href: string) => {
    return pathname === href
  }

  const UserProfileButton = ({ className = "" }: { className?: string }) => (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center gap-x-4 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none ${className}`}>
        {session?.user?.image ? (
          <img
            alt=""
            src={session.user.image}
            className="size-8 rounded-full bg-gray-800"
          />
        ) : (
          <div className="size-8 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <span className="sr-only">Your profile</span>
        <span aria-hidden="true" className="hidden lg:inline">
          {session?.user?.name || 'User'}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {session?.user?.name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email || 'user@example.com'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
      <div>
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
            >
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                  </button>
                </div>
              </TransitionChild>
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-2 ring-1 ring-white/10" style={{ backgroundColor: '#070808' }}>
                <div className="flex h-16 shrink-0 items-center">
                  <Link href="/dashboard">
                    <svg 
                      className="h-6 w-auto" 
                      fill="#Df7626"
                      viewBox="0 0 106 28" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M11.5862 5.43504L17.3821 11.0823L20.1683 8.36884L11.5779 0L2.98483 8.36884L5.76276 11.0743L11.5862 5.43504ZM11.5779 22.4897L0 11.214V16.7242L11.5779 28L23.1531 16.7242V11.214L11.5779 22.4897ZM8.57061 13.8274L11.5765 10.8999L14.5825 13.8274L11.5765 16.7549L8.57061 13.8274Z"></path>
                      <path d="M50.7331 24.065H46.734V18.8754H36.2036V14.3201L36.5505 13.791L42.9533 4.63972C43.3244 4.09703 43.9661 3.76123 44.6598 3.76123H48.6659C49.8071 3.76123 50.7331 4.66686 50.7331 5.78278V14.9612H53.7681V18.872H50.7331V24.0616V24.065ZM40.5774 14.9612H46.734V7.67206H45.6795L40.5774 14.9612ZM70.5764 24.065H66.5772V18.8754H56.0469V14.3201L56.3937 13.791L62.7966 4.63972C63.192 4.08346 63.8267 3.76123 64.5031 3.76123H68.5092C69.6503 3.76123 70.5764 4.66686 70.5764 5.78278V14.9612H73.6114V18.872H70.5764V24.0616V24.065ZM60.4207 14.9612H66.5772V7.67206H65.5228L60.4207 14.9612ZM81.7242 24.0616H92.7193C93.8604 24.0616 94.7865 23.1559 94.7865 22.04V5.78278C94.7865 4.66686 93.8604 3.76123 92.7193 3.76123H81.7242C80.583 3.76123 79.657 4.66686 79.657 5.78278V22.04C79.657 23.1559 80.583 24.0616 81.7242 24.0616ZM90.7874 20.1507H83.6561V20.1473V7.67206H90.7874V20.1507ZM105.997 24.065H101.998V8.16388L100.114 10.0057L97.2873 7.24129L100.822 3.78158L101.699 3.76123H103.933C105.074 3.76123 106 4.66686 106 5.78278V24.065H105.997ZM73.7262 22.5214L75.5461 20.7417C75.5799 20.7086 75.6348 20.7086 75.6687 20.7417L77.4885 22.5214C77.5224 22.5545 77.5224 22.6082 77.4885 22.6413L75.6687 24.4209C75.6348 24.454 75.5799 24.454 75.5461 24.4209L73.7262 22.6413C73.6924 22.6082 73.6924 22.5545 73.7262 22.5214Z"></path>
                    </svg>
                  </Link>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className={classNames(
                                isCurrentPage(item.href)
                                  ? 'bg-gray-800 text-white'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors duration-200',
                              )}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <item.icon aria-hidden="true" className="size-6 shrink-0" />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li>
                      <div className="text-xs/6 font-semibold text-gray-400">Your teams</div>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        {teams.map((team) => (
                          <li key={team.name}>
                            <Link
                              href={team.href}
                              className="text-gray-400 hover:bg-gray-800 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors duration-200"
                            >
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                                {team.initial}
                              </span>
                              <span className="truncate">{team.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li className="-mx-6 mt-auto">
                      <UserProfileButton className="w-full px-6 py-3" />
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6" style={{ backgroundColor: '#070808' }}>
            <div className="flex h-16 shrink-0 items-center">
              <Link href="/dashboard">
                <svg 
                  className="h-6 w-auto" 
                  fill="#Df7626"
                  viewBox="0 0 106 28" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M11.5862 5.43504L17.3821 11.0823L20.1683 8.36884L11.5779 0L2.98483 8.36884L5.76276 11.0743L11.5862 5.43504ZM11.5779 22.4897L0 11.214V16.7242L11.5779 28L23.1531 16.7242V11.214L11.5779 22.4897ZM8.57061 13.8274L11.5765 10.8999L14.5825 13.8274L11.5765 16.7549L8.57061 13.8274Z"></path>
                  <path d="M50.7331 24.065H46.734V18.8754H36.2036V14.3201L36.5505 13.791L42.9533 4.63972C43.3244 4.09703 43.9661 3.76123 44.6598 3.76123H48.6659C49.8071 3.76123 50.7331 4.66686 50.7331 5.78278V14.9612H53.7681V18.872H50.7331V24.0616V24.065ZM40.5774 14.9612H46.734V7.67206H45.6795L40.5774 14.9612ZM70.5764 24.065H66.5772V18.8754H56.0469V14.3201L56.3937 13.791L62.7966 4.63972C63.192 4.08346 63.8267 3.76123 64.5031 3.76123H68.5092C69.6503 3.76123 70.5764 4.66686 70.5764 5.78278V14.9612H73.6114V18.872H70.5764V24.0616V24.065ZM60.4207 14.9612H66.5772V7.67206H65.5228L60.4207 14.9612ZM81.7242 24.0616H92.7193C93.8604 24.0616 94.7865 23.1559 94.7865 22.04V5.78278C94.7865 4.66686 93.8604 3.76123 92.7193 3.76123H81.7242C80.583 3.76123 79.657 4.66686 79.657 5.78278V22.04C79.657 23.1559 80.583 24.0616 81.7242 24.0616ZM90.7874 20.1507H83.6561V20.1473V7.67206H90.7874V20.1507ZM105.997 24.065H101.998V8.16388L100.114 10.0057L97.2873 7.24129L100.822 3.78158L101.699 3.76123H103.933C105.074 3.76123 106 4.66686 106 5.78278V24.065H105.997ZM73.7262 22.5214L75.5461 20.7417C75.5799 20.7086 75.6348 20.7086 75.6687 20.7417L77.4885 22.5214C77.5224 22.5545 77.5224 22.6082 77.4885 22.6413L75.6687 24.4209C75.6348 24.454 75.5799 24.454 75.5461 24.4209L73.7262 22.6413C73.6924 22.6082 73.6924 22.5545 73.7262 22.5214Z"></path>
                </svg>
              </Link>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={classNames(
                            isCurrentPage(item.href)
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors duration-200',
                          )}
                        >
                          <item.icon aria-hidden="true" className="size-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <div className="text-xs/6 font-semibold text-gray-400">Your teams</div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {teams.map((team) => (
                      <li key={team.name}>
                        <Link
                          href={team.href}
                          className="text-gray-400 hover:bg-gray-800 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold transition-colors duration-200"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                            {team.initial}
                          </span>
                          <span className="truncate">{team.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="-mx-6 mt-auto">
                  <UserProfileButton className="w-full px-6 py-3" />
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <DashBackground />

        <div className="sticky top-0 z-40 flex items-center gap-x-6 px-4 py-4 shadow-xs sm:px-6 lg:hidden" style={{ backgroundColor: '#070808' }}>
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-400 lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
          <div className="flex-1 text-sm/6 font-semibold text-white">Dashboard</div>
          <UserProfileButton />
        </div>

        <main className="py-10 lg:pl-72 relative min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 relative z-10">{children}</div>
        </main>
      </div>
    </>
  )
}
