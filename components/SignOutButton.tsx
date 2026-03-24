"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      className={className}
      onClick={async () => {
        const supabase = createClient();
        if (!supabase) return;
        setBusy(true);
        await supabase.auth.signOut();
        router.refresh();
        router.push("/");
      }}
    >
      {busy ? "…" : "로그아웃"}
    </button>
  );
}
