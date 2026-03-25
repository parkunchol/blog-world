import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Noto_Sans_KR } from "next/font/google";
import { BlogShell } from "@/components/BlogShell";
import { ConfigBanner } from "@/components/ConfigBanner";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "themoa.me",
    template: "%s · themoa.me",
  },
  description:
    "주식, 테크, 드라마·영화·노래 순위 등 — themoa.me 허브",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className={`${notoSansKr.className} min-h-full flex flex-col`}>
        <ConfigBanner />
        <BlogShell user={user}>{children}</BlogShell>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
