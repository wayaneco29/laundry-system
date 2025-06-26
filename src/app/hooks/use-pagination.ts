"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function usePagination() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateURL = useCallback(
    (updates: Record<string, string | number>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === 0) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const getPage = () => Number(searchParams.get("page")) || 1;
  const getLimit = () => Number(searchParams.get("limit")) || 10;
  const getSearch = () => searchParams.get("search") || "";

  return {
    updateURL,
    getPage,
    getLimit,
    getSearch,
  };
}
