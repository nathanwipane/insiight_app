export type OrgTheme = {
  org_id: string;
  logo_url: string | null;
  primary_colour: string;
  secondary_colour: string;
  presentation_bg_colour: string;
  font_family: string | null;
  website: string | null;
  brand_statement: string | null;
  phone_numbers: { label: string; number: string }[];
  considerations: string | null;
};

export type PCRData = {
  id: number;
  campaign_id: string;
  report_type: string;
  week_end_date: string;
  executive_summary: string;
  target_summary: string;
  strategic_insight: string;
  targeted_segments: string[];
  top_personas: {
    name: string;
    relevance: string;
    description: string;
  }[];
  recommendations: string;
  created_at: string;
};

export type CampaignDetail = {
  campaign_name: string;
  advertiser_name: string | null;
  agency_name: string | null;
  start_date: string;
  end_date: string;
  regions: string[];
  total_impressions: number;
  reach: number;
  frequency: number;
  total_ad_plays: number;
  avg_daily_impressions: number;
  total_assets: number;
  total_hours_played: number;
};

export type SuburbData = {
  suburb: string;
  state: string;
  total_impressions: number;
};

export type DemoSegment = {
  segment_type: string;
  data: { key: string; label: string; proportion: number; index: number }[];
  total_weight: number;
};

export type PopImage = {
  id: number;
  url: string;
  title: string;
  description: string | null;
  location: string | null;
  captured_at: string | null;
};

export type PCRConfig = {
  campaign_id: string;
  gallery_image_ids: number[];
  cover_image_id: number | null;
  overview_image_id: number | null;
  cpm: number | null;
};

export type SlideProps = {
  theme: OrgTheme;
  campaign: CampaignDetail;
  pcr: PCRData;
  reportDate: string;
};
