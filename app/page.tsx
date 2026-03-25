import type { Metadata } from "next";
import { HomeDailyFortune } from "@/components/home/HomeDailyFortune";
import { HomeMarketSnapshot } from "@/components/home/HomeMarketSnapshot";
import { HomePpomppuFeeds } from "@/components/home/HomePpomppuFeeds";
import { HomeRuliwebFeeds } from "@/components/home/HomeRuliwebFeeds";

export const metadata: Metadata = {
  title: "홈",
  description:
    "themoa.me — 주식, 테크, 드라마·영화·노래 순위 등 큐레이션 허브.",
};

export const revalidate = 300;

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10">
      <HomeDailyFortune />
      <HomeMarketSnapshot />
      <HomeRuliwebFeeds />
      <HomePpomppuFeeds />
    </main>
  );
}
