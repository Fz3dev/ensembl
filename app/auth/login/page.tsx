import { Suspense } from "react"
import LoginForm from "@/components/auth/login-form"

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string; redirectTo?: string }
}) {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Suspense fallback={<div>Chargement...</div>}>
        <LoginForm />
        {searchParams?.message && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-md">{searchParams.message}</div>
        )}
      </Suspense>
    </div>
  )
}

