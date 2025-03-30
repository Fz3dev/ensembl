import SignUpForm from "@/components/auth/signup-form"

export default function SignUpPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Ensemble Calendar Logo" className="h-20 w-20 mb-4" />
          <h1 className="text-2xl font-bold text-center">Créer un compte</h1>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
