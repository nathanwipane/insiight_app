// ––––––––––– constants/types.ts –––––––––––
import { ColumnFiltersState } from "@tanstack/react-table"
import {type LucideIcon } from "lucide-react"

export interface NavMainProps {
    title: string
    url: string
    icon?: LucideIcon
    active?: boolean
  }

export type Role = {
  id: number;
  name: string;
  description: string;
}

export type User = {
  id: string,
  email: string,
  first_name: string,
  last_name: string,
  role: Role,
  user_id?: string;
  org_id: string,
  org_name?: string,
  campaign_name?: string,
  parent_org_id?: string,
  jwt?: string, // Optional JWT token for authentication
  role_id: number,
  last_login: string,
  permissions?: string[] // Optional permissions array
  sessionExpires?: number // Optional session expiration timestamp
  org_type?: "media_owner" | "media_agency" | "brand_advertiser" | string
}

export type SelectedAssetSOV = {
    asset_id: number;
    selected_sov: number;
}

export type AudienceMetric = {
    pct: number;
    index: number;
    total: number;
}

export type DemographicData = {
    sa2_code: string;
    suburb_name: string;
    total_people: number;
    target_audiences: {
        [key: string]: AudienceMetric;
    };
    centroid_lat: string;
    centroid_lng: string;
    total_indexed_audiences: number;
    total_target_audiences: number;
    weightedAudienceIndex: number;

}

export type CampaignType = {
    campaign_id: string;
    client_name: string;
    impressions_target: number;
    organisation_name: string;
    impressions_achieved: number;
    campaign_date: Date[] | null;
    start_date: string;
    end_date: string;
    description: string;
    campaign_name: string;
    last_updated: string | null;
    agency_name: string;
    org_id: string;
    notes: string;
    display_creative: string;
    creative_list?: string[];
    asset_list?: SelectedAssetSOV[];
    status:string;
    billing_amount?: number;
    id: number;
    projected_impressions: number;
    projected_reach: number;
    goals: string;
    target_audiences?: string | string[];
}

export interface CampaignInfoType {
    id: number;
    org_id: string;
    campaign_id: string;
    start_date: string;
    end_date: string;
    notes: string | null;
    impressions_achieved: number | null;
    impressions_target: number;
    creative_list: string[];
    asset_list: SelectedAssetSOV[];
    client_name: string;
    description: string;
    display_creative: string;
    agency_name: string;
    target_audiences: string | null;
    campaign_name: string;
    created_by: string | null;
    created_at: string;
    last_updated: string | null;
    status: string;
    goals: string;
    projected_impressions: number;
    projected_reach: number;
    organisation_name: string | null;
    last_updated_impression: string;
}

export interface AssetType {
  asset_id: number;
  asset_name: string;
  asset_type: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  start_time: string;
  end_time: string;
  width_m: number | null;
  height_m: number | null;
  spot_length_sec: number | null;
  total_impressions: number;
  operational_start: string;
  operational_end: string;
  address: string;
  orientation: string;
  is_visible?: boolean;
  cpm: number;
  image: string;
  asset_class: string;
  day_visibility?: Array<Array<{x: number, y: number}>>;
  night_visibility?: Array<Array<{x: number, y: number}>>;
  children?: AssetType[]
  parent_id?: number | null

}

export interface AssetInfoType {
  asset_id: number;
  asset_name: string;
  latitude: number;
  longitude: number;
  day_visibility: Array<Array<{x: number, y: number}>> | null;
  night_visibility: Array<Array<{x: number, y: number}>> | null;
  operational_start: string;
  operational_end: string;
  spot_length_sec: number | null;
  asset_type: string;
  width_m: number | null;
  height_m: number | null;
  orientation: string;
  status: string;
  description: string;
  created_at: string | null;
  updated_at: string;
  address: string;
  image: string;
  asset_class: string;
  cpm: number | null;
  is_visible: number;
  client_asset_id: string | null;
  mobile_polygon: any | null;
  parent_id: number | null;
}
export interface CampaignInfoApiResponse {
  data: CampaignInfoDataType[],
  status: boolean
}

export interface CampaignInfoDataType {
  campaign_id: string,
  client_name: string,
  impressions_target: number,
  impressions_achieved: number,
  start_date: string,
  end_date: string,
  description: string | null,
  last_updated: string | null,
  agency_name: string
}


export interface HeaderData {
  isLoading: boolean,
  error: Error | null,
  clientName: string | null,
  agencyName: string | null
}

export interface ProgressBarData {
  isLoading: boolean,
  error: Error | null,
  progressPercentage: number | null,
  startDate: Date | null,
  endDate: Date | null,
  impressionsTarget: number | null,
  impressionsAchieved: number | null
}


export interface ChartData {
  name: string;
  value: number;
}

export const SWRCongfigObj =   { 
        refreshInterval: 3600000, // Refresh every min
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        errorRetryCount: 3
        }

// Asset interface for type safety
export interface Asset {
    asset_id: number;
    asset_name: string;
    latitude: number;
    longitude: number;
    asset_type: string;
    asset_class: string;
    address: string;
    image: string;
    mobile_polygon?: string; // Added mobile polygon property
    audience_segments_performance?: {
        [key: string]: {value: number, index: number};
    };
    total_reach?: number;
    total_impressions?: number;
    frequency?: number;
    conflicting_campaign?: string;
    conflict_start_date?: string;
    conflict_end_date?: string;
    cpm?: number;
    // SOV-related properties
    sov_percentage?: number;
    status?: string;
    original_total_impressions?: number;
    original_total_reach?: number;
}

export type MultiSelectOption = {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  description?: string
  disabled?: boolean
}

export type SOVAsset = {
    asset_id: number;
    asset_name: string;
    asset_type: string;
    min_available_sov: number;
}

export interface TargetedSegment {
  index: number;
  reach: number;
  status: string;
  audience: string;
}

export interface TopPersona {
  reach: number;
  title: string;
  description: string;
  based_on_segments: string;
}

export interface CampaignMetaData {
  goals: string;
  status: string;
  end_date: string;
  model_name: string;
  start_date: string;
  campaign_id: string;
  client_name: string;
  description: string;
  campaign_name: string;
  projected_reach: number;
  target_audiences: any[];
  projected_impressions: number;
}

export interface PCRData {
  id: number;
  campaign_id: string;
  total_impressions: number;
  total_unique_reach: number;
  exec_summary: string;
  targeted_segments: TargetedSegment[];
  audience_assessment: string;
  top_personas: TopPersona[];
  recommendations: string;
  created_at: string;
  campaign_meta_data: CampaignMetaData;
  creative_list: Record<string, any>;
  display_creative: string;
  target_audiences: string;
  asset_list: number[];
  price_of_campaign: number;
  organisation_name: string | null;
}

export interface TimeseriesData {
  date: string;
  total_impressions: number;
  total_reach: number;
}

export interface CampaignPCR {
  data: PCRData;
  timeseries: TimeseriesData[];
}


export interface ClickableArea {
  href: string;
  coords: string;
  alt: string;
  title: string;
}

export interface Notification {
  user_notification_id: number;
  notification_id: number;
  delivered_at: string | null;
  title: string;
  description: string;
  category: string;
  campaign_id: string;
  notification_created_at: string | null;
  seen_at: string | null;
}

export interface FilterState {
  columnFilters: ColumnFiltersState
  start_date: string | undefined
  end_date: string | undefined
}

// Type definitions
export interface ProofOfPlayImage {
    id: number;
    campaign_id: string;
    asset_id: string | null;
    url: string;
    title: string;
    description: string;
    time_uploaded: string;
}

// Define TypeScript interfaces
export interface MetricsData {
  total_impressions: number;
  total_unique_reach: number;
  average_daily_impressions: number;
  average_daily_reach: number;
  ad_plays: number | null;
  date: string;
}

export interface Metrics {
  total_impressions: number;
  total_unique_reach: number;
  average_daily_impressions: number;
  average_daily_reach: number;
  ad_plays: number | null;
  frequency?: number;
}

export interface Campaign {
  id: number;
  org_id: string;
  campaign_id: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  impressions_achieved: number | null;
  impressions_target: number;
  creative_list: string[];
  asset_list: Array<{
    asset_id: number;
    selected_sov: number;
  }>;
  client_name: string;
  description: string;
  display_creative: string;
  agency_name: string | null;
  target_audiences: string;
  campaign_name: string;
  created_by: string;
  created_at: string;
  last_updated: string | null;
  status: string;
  goals: string | null;
  projected_impressions: number | null;
  projected_reach: number | null;
  organisation_name: string | null;
}

export interface CampaignsApiResponse {
  data: {
    campaigns: Campaign[];
  };
  status: boolean;
}

export interface Deltas {
  delta_impressions: number;
  delta_reach: number;
  delta_frequency: string;
  delta_average_impressions: number;
  delta_ad_plays: number | null;
  delta_average_reach?: number
}

//This is the type for the form that is used in the agency campaign planner using locations
export interface AgencyPlannerForm {
  id?: number | null;
  locations: DemographicData[];
  target_audiences: targetAudience[];
  description: string;
  campaign_name: string;
  billboards: BillboardData[];
}


export interface targetAudience {
  id: number;
  category: string;
  label: string;
  path_to_metric: string;
}

export interface billboardMapType {
  id: number;
  state: string;
  latitude: number;
  longitude: number;
  backlit: string | null;
  sa2_code: string;
  site_name: string;
}

export interface BillboardData{
  id: number;
  site_id: string;
  site_address: string;
  billboard_types: string;
  latitude: string;
  longitude: string;
  state: string;
  suburb: string;
  inbound: string;
  backlit: string;
  image_url: string;
  scraped_at: string;
  updated_at: string;
  site_name: string;
  sa2_code: string;
}


export interface ClientInfoType {
  client_name: string;
  client_id: string;
  plan_type: string;
  logo: string;
  last_updated: string | null;
  setup_step : number;
  organisation_type:string
}

export interface DemographicsTotals {
  total_males: number;
  total_females: number;
  age_distribution: Record<string, number>;
  education_distribution: Record<string, number>;
  occupation_distribution: Record<string, number>;
  total_reach: number;
  median_age: number;
  median_weekly_household_income: number;
  average_income_personal: number;
  average_income_family: number;
  last_updated: string;
}

export interface DemographicsIndexed {
  [key: string]: string | null;
}

export interface DemographicsResponse {
  data: {
    totals: DemographicsTotals;
    indexed: DemographicsIndexed;
  };
}

export interface IncomeApiData {
  income_range: string;
  total_reach: number;
}

export interface CreativeBreakdownItem {
  ad_plays: number;
  reach: number;
  impressions: number;
  url: string;
  first_played: string;
  last_played: string;
}

export interface CreativeBreakdownResponse {
  creative_breakdown: Record<string, CreativeBreakdownItem>;
}

export interface NewsletterReport {
  week_end_date: string;
  total_impressions: number;
  unique_reach: number;
  performance_summary: string;
}

export interface ImpressionsChartsType {
  impressions_by_hour?: boolean;
  impressions_by_suburb?: boolean;
}

export interface ImpressionsChartsResponse {
  data: {
    impressions_by_hour?: Record<string, number>;
    impressions_by_suburb?: Record<string, number>;
  };
  status: boolean;
}

export interface CampaignAIOverview {
  exec_summary: string;
  audience_assessment: string;
}

export interface CoreMetricsResponse {
  data: MetricsData[];
  status: boolean;
}