import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff8f5] px-5">
      <SignUp fallbackRedirectUrl="/auth/redirect" />
    </main>
  );
}