import apiClient from "@/lib/config";
import { ImpressionsChartsType, ImpressionsChartsResponse } from "@/constants/types";

export const fetcher = async ([url, token]: [string, string]) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let res = await apiClient.get(url, { headers });
  return res.data.data;
};

export const ClassicGetFetcher = async ([url, token]: [string, string]) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let res = await apiClient.get(url, { headers });
  return res.data.data[0];
};

export const fetcherNotifications = async ([url, token]: [string, string]) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let res = await apiClient.get(url, { headers });
  return res.data;
};

// POST fetcher for /get-impressions-charts — used for both
// impressions_by_hour and impressions_by_suburb (different body, separate SWR cache keys)
export const impressionsChartsFetcher = async (
  [url, token, body]: [string, string, ImpressionsChartsType]
): Promise<ImpressionsChartsResponse> => {
  const res = await apiClient.post<ImpressionsChartsResponse>(url, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};