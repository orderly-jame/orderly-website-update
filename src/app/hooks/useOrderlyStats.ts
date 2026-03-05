import { useState, useEffect } from "react";

interface OrderlyStats {
  tvl: number;
  tradingVolume: number;
  liveBuilders: number;
  chains: number;
}

const FALLBACK: OrderlyStats = {
  tvl: 21390000,
  tradingVolume: 42500000,
  liveBuilders: 261,
  chains: 17,
};

export function useOrderlyStats(): OrderlyStats {
  const [stats, setStats] = useState<OrderlyStats>(FALLBACK);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchStats() {
      const [tvlRes, volumeRes, buildersRes, chainsRes] = await Promise.allSettled([
        fetch("https://api.orderly.org/v1/public/balance/stats", { signal }).then((r) => r.json()),
        fetch("https://api.orderly.org/v1/public/futures", { signal }).then((r) => r.json()),
        fetch("https://api.orderly.org/v1/public/broker/name", { signal }).then((r) => r.json()),
        fetch("https://api.orderly.org/v1/public/chain_info", { signal }).then((r) => r.json()),
      ]);

      setStats({
        tvl:
          tvlRes.status === "fulfilled" && tvlRes.value?.success
            ? tvlRes.value.data.total_holding
            : FALLBACK.tvl,
        tradingVolume:
          volumeRes.status === "fulfilled" && volumeRes.value?.success
            ? volumeRes.value.data.rows.reduce(
                (sum: number, row: { "24h_amount": number }) => sum + row["24h_amount"],
                0
              )
            : FALLBACK.tradingVolume,
        liveBuilders:
          buildersRes.status === "fulfilled" && buildersRes.value?.success
            ? buildersRes.value.data.rows.length
            : FALLBACK.liveBuilders,
        chains:
          chainsRes.status === "fulfilled" && chainsRes.value?.success
            ? chainsRes.value.data.rows.length
            : FALLBACK.chains,
      });
    }

    fetchStats();
    return () => controller.abort();
  }, []);

  return stats;
}

export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  return `$${(value / 1_000_000).toFixed(2)}M`;
}
