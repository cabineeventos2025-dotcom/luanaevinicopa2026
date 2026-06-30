import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWorldCupData, type FetchResult } from "./footballApiService";
import type { WorldCupData } from "./types";

const REFRESH_MS = 5 * 60 * 1000;

export function useWorldCupData() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [source, setSource] = useState<FetchResult["source"]>("mock");
  const [warning, setWarning] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetchWorldCupData();
      setData(res.data);
      setSource(res.source);
      setWarning(res.warning);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("[useWorldCupData]", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(() => load(), REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load]);

  return { data, source, warning, loading, refreshing, lastUpdated, refresh: () => load(true) };
}
