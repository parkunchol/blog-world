"use client";

import Link from "next/link";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { SITE_NAV_LINKS } from "@/components/site-nav";

const linkClass =
  "block rounded-lg px-3 py-3 text-base font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--accent)]";

/** 모바일 전용: 햄버거 + 드로어(바로가기만). 오버레이는 portal로 body에 붙여 헤더 stacking에 가리지 않게 함. */
const noopSubscribe = () => () => {};

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={titleId}
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {mounted && open
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="메뉴 배경 닫기"
                className="fixed top-14 right-0 bottom-0 left-0 z-[100] bg-black/40 backdrop-blur-sm sm:hidden"
                onClick={() => setOpen(false)}
              />
              <div
                id={titleId}
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-nav-heading"
                className="fixed top-14 right-0 bottom-0 z-[110] flex w-[min(100%,20rem)] flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:hidden"
              >
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
                  <h2 id="mobile-nav-heading" className="text-sm font-semibold">
                    바로가기
                  </h2>
                  <button
                    type="button"
                    aria-label="닫기"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                    onClick={() => setOpen(false)}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-4">
                  <ul className="space-y-0.5">
                    {SITE_NAV_LINKS.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={linkClass}
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
