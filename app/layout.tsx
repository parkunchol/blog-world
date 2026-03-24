import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { BlogShell } from "@/components/BlogShell";
import { ConfigBanner } from "@/components/ConfigBanner";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tech Crunch Blog",
    template: "%s · Tech Crunch Blog",
  },
  description: "Supabase와 연동된 블로그입니다.",
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
      </body>
    </html>
  );
}
