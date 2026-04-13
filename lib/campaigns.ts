// ––––––––––– lib/campaigns.ts –––––––––––
export function formatImpressions(n: number | null | undefined): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

export function formatCampaignDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric", month: "short", year: "2-digit",
  });
}

export function computeCampaignStatus(campaign: {
  status?: string; start_date: string; end_date: string
}): string {
  if (campaign.status) return campaign.status;
  const endDate = new Date(campaign.end_date);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  if (endDate < twoWeeksAgo) return "completed";
  if (new Date(campaign.start_date) > new Date()) return "scheduled";
  return "active";
}

export function computeCampaignProgress(campaign: {
  impressions_achieved?: number | null;
  impressions_target?: number;
  projected_impressions?: number;
}): number {
  const target = campaign.impressions_target || campaign.projected_impressions;
  const achieved = campaign.impressions_achieved;
  if (!target || !achieved) return 0;
  return Math.min(Math.round((achieved / target) * 100), 100);
}
