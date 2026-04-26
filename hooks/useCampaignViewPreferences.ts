"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import apiClient from "@/lib/config";

export type ViewPreferences = {
  suburbs?: string[];
  occupation?: string[];
  over_indexed?: string[];
};

export function useCampaignViewPreferences(campaignId: string) {
  const { data: session } = useSession();
  const token = (session?.user as User)?.jwt ?? "";

  const { data, mutate } = useSWR<ViewPreferences>(
    token && campaignId
      ? [`/v2/campaign/${campaignId}/view-preferences`, token]
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const preferences: ViewPreferences = data ?? {};

  const updatePreference = async (
    segmentType: "suburbs" | "occupation" | "over_indexed",
    visibleKeys: string[]
  ) => {
    await apiClient.put(
      `/v2/campaign/${campaignId}/view-preferences`,
      { segment_type: segmentType, visible_keys: visibleKeys },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    mutate();
  };

  return { preferences, updatePreference };
}
