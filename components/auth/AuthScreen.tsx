"use client";

import type { Provider } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Tab = "login" | "signup";

const NAVER_PROVIDER_ID =
  process.env.NEXT_PUBLIC_SUPABASE_AUTH_NAVER_PROVIDER ?? "custom:naver";

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconChat({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconBadge({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9h10M7 13h6" />
    </svg>
  );
}

export function AuthScreen({ defaultTab }: { defaultTab: Tab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const err = searchParams.get("error");
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [pending, setPending] = useState<Provider | null>(null);
  const naverProv = NAVER_PROVIDER_ID as Provider;

  const redirectTo = useCallback(() => {
    const base =
      typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/auth/callback?next=/`;
  }, []);

  const signIn = useCallback(
    async (provider: Provider) => {
      const supabase = createClient();
      if (!supabase) return;
      setPending(provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo(),
        },
      });
      setPending(null);
      if (error) {
        router.replace(`/auth/login?error=oauth&message=${encodeURIComponent(error.message)}`);
      }
    },
    [redirectTo, router],
  );

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-xl font-bold text-[var(--text)]">
          {tab === "login" ? "로그인" : "회원가입"}
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--text-muted)]">
          소셜 계정으로 간편하게 시작하세요. (별도 글쓰기 화면은 없습니다.)
        </p>

        <div className="mt-6 flex rounded-xl bg-[var(--surface-muted)] p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              tab === "login"
                ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              tab === "signup"
                ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            회원가입
          </button>
        </div>

        {err ? (
          <p
            className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700"
            role="alert"
          >
            인증에 실패했습니다. Supabase에서 해당 제공자를 켰는지, 리다이렉트
            URL을 등록했는지 확인해 주세요.
          </p>
        ) : null}

        <ul className="mt-6 flex flex-col gap-3">
          <li>
            <button
              type="button"
              disabled={pending !== null}
              onClick={() => signIn("google")}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-white py-3.5 text-sm font-medium text-neutral-800 shadow-sm transition-opacity hover:bg-neutral-50 disabled:opacity-60"
            >
              <IconGlobe className="text-neutral-600" />
              {pending === "google" ? "연결 중…" : "Google 계정으로 계속"}
            </button>
          </li>
          <li>
            <button
              type="button"
              disabled={pending !== null}
              onClick={() => signIn("kakao")}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#f4e04d] py-3.5 text-sm font-medium text-neutral-900 shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <IconChat className="text-neutral-800" />
              {pending === "kakao" ? "연결 중…" : "카카오 계정으로 계속"}
            </button>
          </li>
          <li>
            <button
              type="button"
              disabled={pending !== null}
              onClick={() => signIn(naverProv)}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#2a593e] py-3.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-60"
            >
              <IconBadge className="text-white/90" />
              {pending === naverProv ? "연결 중…" : "네이버 계정으로 계속"}
            </button>
          </li>
        </ul>

        <p className="mt-6 text-center text-xs leading-relaxed text-[var(--text-muted)]">
          버튼 문구는 서비스 안내용이며, 각 사의 상표·로고를 사용하지 않습니다.
          네이버는 Supabase 대시보드에서 커스텀 OAuth(OIDC)로{" "}
          <code className="rounded bg-[var(--surface-muted)] px-1">
            {NAVER_PROVIDER_ID}
          </code>{" "}
          식별자를 맞춰 주세요.
        </p>

        <p className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            블로그 홈으로
          </Link>
        </p>
      </div>
    </div>
  );
}
