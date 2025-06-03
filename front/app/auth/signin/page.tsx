"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/animate-ui/radix/dialog';
import AnimatedBackground from "@/components/layout/background";

export default function SignIn() {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/")
      }
    })
  }, [router])

  const handleSignIn = async () => {
    setLoading(true)
    try {
      await signIn("azure-ad", { callbackUrl: "/" })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/")
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <a 
              href="https://www.4401.earth" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105 duration-300"
            >
              <svg 
                className="w-24 h-auto md:w-32" 
                fill="#Df7626"
                viewBox="0 0 106 28" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M11.5862 5.43504L17.3821 11.0823L20.1683 8.36884L11.5779 0L2.98483 8.36884L5.76276 11.0743L11.5862 5.43504ZM11.5779 22.4897L0 11.214V16.7242L11.5779 28L23.1531 16.7242V11.214L11.5779 22.4897ZM8.57061 13.8274L11.5765 10.8999L14.5825 13.8274L11.5765 16.7549L8.57061 13.8274Z"></path>
                <path d="M50.7331 24.065H46.734V18.8754H36.2036V14.3201L36.5505 13.791L42.9533 4.63972C43.3244 4.09703 43.9661 3.76123 44.6598 3.76123H48.6659C49.8071 3.76123 50.7331 4.66686 50.7331 5.78278V14.9612H53.7681V18.872H50.7331V24.0616V24.065ZM40.5774 14.9612H46.734V7.67206H45.6795L40.5774 14.9612ZM70.5764 24.065H66.5772V18.8754H56.0469V14.3201L56.3937 13.791L62.7966 4.63972C63.192 4.08346 63.8267 3.76123 64.5031 3.76123H68.5092C69.6503 3.76123 70.5764 4.66686 70.5764 5.78278V14.9612H73.6114V18.872H70.5764V24.0616V24.065ZM60.4207 14.9612H66.5772V7.67206H65.5228L60.4207 14.9612ZM81.7242 24.0616H92.7193C93.8604 24.0616 94.7865 23.1559 94.7865 22.04V5.78278C94.7865 4.66686 93.8604 3.76123 92.7193 3.76123H81.7242C80.583 3.76123 79.657 4.66686 79.657 5.78278V22.04C79.657 23.1559 80.583 24.0616 81.7242 24.0616ZM90.7874 20.1507H83.6561V20.1473V7.67206H90.7874V20.1507ZM105.997 24.065H101.998V8.16388L100.114 10.0057L97.2873 7.24129L100.822 3.78158L101.699 3.76123H103.933C105.074 3.76123 106 4.66686 106 5.78278V24.065H105.997ZM73.7262 22.5214L75.5461 20.7417C75.5799 20.7086 75.6348 20.7086 75.6687 20.7417L77.4885 22.5214C77.5224 22.5545 77.5224 22.6082 77.4885 22.6413L75.6687 24.4209C75.6348 24.454 75.5799 24.454 75.5461 24.4209L73.7262 22.6413C73.6924 22.6082 73.6924 22.5545 73.7262 22.5214Z"></path>
              </svg>
            </a>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button 
                className="text-black gap-3 hover:opacity-90 transition-all duration-300 font-semibold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ backgroundColor: '#f1f0f0' }}
              >
                Sign In to Dashboard
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Access Monitoring Dashboard</DialogTitle>
                <DialogDescription>
                  Sign in with your Azure Active Directory credentials to access the 44.01 monitoring platform.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    You will be redirected to Microsoft Azure for secure authentication.
                  </p>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSignIn}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    "Sign in with Azure AD"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Footer Attribution */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6">
        <div className="text-center">
          <p className="text-white/60 text-sm">
            Designed by{' '}
            <a 
              href="https://www.4401.earth" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors duration-300"
            >
              44.01 Digitalization Team
            </a>
          </p>
          <p className="text-white/40 text-xs mt-1">
            Carbon removal technology for a sustainable future
          </p>
        </div>
      </div>
    </div>
  )
} 