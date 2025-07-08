import { useSession, signOut } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/animate-ui/radix/dropdown-menu'

interface UserProfileButtonProps {
  className?: string
  showNameAndSignOut?: boolean
}

export default function UserProfileButton({ className = "", showNameAndSignOut = true }: UserProfileButtonProps) {
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`w-full flex items-center gap-x-4 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none ${className}`}
      >
        {session?.user?.image ? (
          <img
            alt=""
            src={session.user.image}
            className="size-8 rounded-full"
          />
        ) : (
          <div className="size-8 rounded-full flex items-center justify-center bg-gray-600">
            <span className="text-sm font-medium text-white">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <span className="sr-only">Your profile</span>
        {showNameAndSignOut && (
          <span aria-hidden="true" className="hidden lg:inline">
            {session?.user?.name || 'User'}
          </span>
        )}
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
        {showNameAndSignOut && (
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer hover:bg-white/10 transition-colors">
            <span>Sign out</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 