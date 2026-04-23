"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import CoverSlide from "@/components/reports/PCRPresentation/slides/CoverSlide";
import OverviewSlide from "@/components/reports/PCRPresentation/slides/OverviewSlide";
import ActivitySlideStatic from "@/components/reports/PCRPresentation/slides/ActivitySlideStatic";
import AudienceSlide from "@/components/reports/PCRPresentation/slides/AudienceSlide";
import PersonasSlide from "@/components/reports/PCRPresentation/slides/PersonasSlide";
import GallerySlide from "@/components/reports/PCRPresentation/slides/GallerySlide";
import CloseSlide from "@/components/reports/PCRPresentation/slides/CloseSlide";
import { OrgTheme, PCRData, CampaignDetail, SuburbData, DemoSegment, PopImage, PCRConfig } from "@/components/reports/PCRPresentation/types";
import apiClient from "@/lib/config";

const SLIDE_W = 1241;
const SLIDE_H = 698;

type HeatmapRow = { h3_cell: string; total_impressions: number; total_ad_plays: number };

export default function SlidesRenderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.campaign_id as string;
  const parentOrgId = params.parent_org_id as string;
  const token = searchParams.get("token") ?? "";

  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<OrgTheme | null>(null);
  const [pcr, setPcr] = useState<PCRData | null>(null);
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [suburbs, setSuburbs] = useState<SuburbData[]>([]);
  const [demographics, setDemographics] = useState<DemoSegment[]>([]);
  const [pops, setPops] = useState<PopImage[]>([]);
  const [pcrConfig, setPcrConfig] = useState<PCRConfig | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapRow[]>([]);

  useEffect(() => {
    if (!token || !campaignId) return;

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      apiClient.get('/v2/organisation/theme', { headers }),
      apiClient.get(`/v2/campaign/${campaignId}/insights`, { headers }),
      apiClient.get(`/v2/campaign/${campaignId}`, { headers }),
      apiClient.get(`/v2/campaign/${campaignId}/suburbs?limit=5`, { headers }),
      apiClient.get(`/v2/campaign/${campaignId}/demographics`, { headers }),
      apiClient.get(`/v2/campaign/${campaignId}/pops`, { headers }),
      apiClient.get(`/v2/campaign/${campaignId}/pcr-config`, { headers }),
      apiClient.get(`/v2/campaign/${campaignId}/heatmap`, { headers }),
    ]).then(([
      themeRes, insightsRes, campaignRes,
      suburbsRes, demoRes, popsRes,
      configRes, heatmapRes
    ]) => {
      setTheme(themeRes.data.data);
      setPcr(insightsRes.data.data.pcr);
      setCampaign(campaignRes.data.data);
      setSuburbs(suburbsRes.data.data ?? []);
      setDemographics(demoRes.data.data ?? []);
      setPops(popsRes.data.data ?? []);
      setPcrConfig(configRes.data.data);
      setHeatmapData(heatmapRes.data.data ?? []);
      setReady(true);
      setTimeout(() => {
        (window as any).__slidesReady = true;
      }, 2000);
    }).catch(err => {
      console.error('Slides render page error:', err);
    });
  }, [token, campaignId]);

  if (!ready || !theme || !pcr || !campaign) {
    return (
      <div style={{
        width: SLIDE_W, height: SLIDE_H,
        background: "#1a1a1a",
        display: "flex", alignItems: "center",
        justifyContent: "center",
        color: "#fff", fontSize: 24,
      }}>
        Loading...
      </div>
    );
  }

  const cleanCampaignName = campaign.campaign_name.includes("|")
    ? campaign.campaign_name.split("|")[1]?.trim() ?? campaign.campaign_name
    : campaign.campaign_name;

  const slideProps = {
    theme,
    campaign: { ...campaign, campaign_name: cleanCampaignName },
    pcr,
    reportDate: pcr.created_at,
  };

  const heroImage = pcrConfig?.cover_image_id
    ? pops.find(p => p.id === pcrConfig.cover_image_id) ?? pops[0] ?? null
    : pops[0] ?? null;

  const overviewImage = pcrConfig?.overview_image_id
    ? pops.find(p => p.id === pcrConfig.overview_image_id) ?? pops[0] ?? null
    : pops[0] ?? null;

  const galleryImages = pcrConfig?.gallery_image_ids?.length
    ? pops.filter(p => pcrConfig.gallery_image_ids.includes(p.id))
    : pops;

  const slides = [
    <CoverSlide key="cover" {...slideProps} heroImage={heroImage} />,
    <OverviewSlide key="overview" {...slideProps} heroImage={overviewImage} pcrConfig={pcrConfig ?? null} />,
    <ActivitySlideStatic key="activity" {...slideProps} suburbs={suburbs} />,
    <AudienceSlide key="audience" {...slideProps} demographics={demographics} />,
    <PersonasSlide key="personas" {...slideProps} />,
    ...galleryImages.map((image, i) => (
      <GallerySlide key={`gallery-${i}`} {...slideProps} image={image} slideNumber={i + 1} totalImages={galleryImages.length} />
    )),
    <CloseSlide key="close" {...slideProps} />,
  ];

  return (
    <div style={{
      background: "#111",
      fontFamily: theme.font_family
        ? `${theme.font_family}, sans-serif`
        : "var(--font-bricolage), 'Bricolage Grotesque', sans-serif",
    }}>
      {slides.map((slide, i) => (
        <div
          key={i}
          data-slide={i}
          style={{
            width: SLIDE_W,
            height: SLIDE_H,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {slide}
        </div>
      ))}
    </div>
  );
}
