import { Suspense } from "react";
import { AuthScreen } from "@/components/auth/AuthScreen";

function AuthFallback() {
  return (
    <div className="mx-auto max-w-md py-20 text-center text-sm text-[var(--text-muted)]">
      불러오는 중…
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthScreen defaultTab="login" />
    </Suspense>
  );
}
