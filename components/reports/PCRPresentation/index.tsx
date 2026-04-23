"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { X, Settings, Download } from "lucide-react";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import apiClient from "@/lib/config";
import {
  OrgTheme, PCRData, CampaignDetail,
  SuburbData, DemoSegment, PopImage, PCRConfig
} from "./types";

import CoverSlide from "./slides/CoverSlide";
import OverviewSlide from "./slides/OverviewSlide";
import ActivitySlide from "./slides/ActivitySlide";
import AudienceSlide from "./slides/AudienceSlide";
import PersonasSlide from "./slides/PersonasSlide";
import GallerySlide from "./slides/GallerySlide";
import CloseSlide from "./slides/CloseSlide";

interface PCRPresentationProps {
  pcr: PCRData;
  campaign: CampaignDetail;
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export default function PCRPresentation({
  pcr, campaign, open, onClose, onOpenSettings
}: PCRPresentationProps) {
  const params = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token = (session?.user as User)?.jwt ?? "";

  // Fetch supporting data
  const { data: theme } = useSWR<OrgTheme>(
    token ? ["/v2/organisation/theme", token] : null, fetcher
  );
  const { data: suburbs = [] } = useSWR<SuburbData[]>(
    token && campaignId ? [`/v2/campaign/${campaignId}/suburbs?limit=5`, token] : null, fetcher
  );
  const { data: demographics = [] } = useSWR<DemoSegment[]>(
    token && campaignId ? [`/v2/campaign/${campaignId}/demographics`, token] : null, fetcher
  );
  const { data: allPops = [] } = useSWR<PopImage[]>(
    token && campaignId ? [`/v2/campaign/${campaignId}/pops`, token] : null, fetcher
  );
  const { data: pcrConfig } = useSWR<PCRConfig>(
    token && campaignId ? [`/v2/campaign/${campaignId}/pcr-config`, token] : null, fetcher
  );

  type HeatmapRow = {
    h3_cell: string;
    total_impressions: number;
    total_ad_plays: number;
  };

  const { data: heatmapData = [] } = useSWR<HeatmapRow[]>(
    token && campaignId
      ? [`/v2/campaign/${campaignId}/heatmap`, token]
      : null,
    fetcher,
    { refreshInterval: 3600000, revalidateOnFocus: false }
  );

  const slidesRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1241);
  const [sidePadding, setSidePadding] = useState(300);
  const [pdfLoading, setPdfLoading] = useState(false);
  const BASELINE_W = 1241;
  const BASELINE_H = 698;

  useEffect(() => {
    const el = slidesRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const padding = Math.max(40, Math.round((w / 1920) * 300));
      setSidePadding(padding);
      setContainerWidth(w - padding * 2);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  const scale = containerWidth / BASELINE_W;

  // Determine gallery images — use config selection if set, else all pops
  const galleryImages: PopImage[] = pcrConfig?.gallery_image_ids?.length
    ? allPops.filter(p => pcrConfig.gallery_image_ids.includes(p.id))
    : allPops;

  const heroImage = pcrConfig?.cover_image_id
    ? allPops.find(p => p.id === pcrConfig.cover_image_id) ?? allPops[0] ?? null
    : allPops[0] ?? null;

  const overviewImage = pcrConfig?.overview_image_id
    ? allPops.find(p => p.id === pcrConfig.overview_image_id) ?? allPops[0] ?? null
    : allPops[0] ?? null;

  // Keyboard — close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleExportPdf = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);

    try {
      // Step 1: Get render token
      const tokenRes = await apiClient.post(
        '/v2/auth/render-token',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const renderToken = tokenRes.data.data.token;

      // Count total slides (5 fixed + gallery images)
      const totalSlides = 5 + galleryImages.length + 1;

      // Step 2: Generate PDF
      const pdfRes = await apiClient.post(
        '/v2/reports/generate-pcr-pdf',
        {
          campaign_id: campaignId,
          parent_org_id: params.parent_org_id,
          render_token: renderToken,
          slide_count: totalSlides,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
          timeout: 120000,
        }
      );

      // Step 3: Trigger download
      const url = URL.createObjectURL(pdfRes.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PCR_${campaignId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  if (!open) return null;

  const activeTheme: OrgTheme = theme ?? {
    org_id: "",
    logo_url: null,
    primary_colour: "#95bbc1",
    secondary_colour: "#ffffff",
    presentation_bg_colour: "#1a1a1a",
    font_family: null,
    website: null,
    brand_statement: null,
    phone_numbers: [],
    considerations: null,
  };

  const reportDate = pcr.created_at;

  const cleanCampaignName = campaign.campaign_name.includes("|")
    ? campaign.campaign_name.split("|")[1]?.trim() ?? campaign.campaign_name
    : campaign.campaign_name;

  const slideProps = {
    theme: activeTheme,
    campaign: { ...campaign, campaign_name: cleanCampaignName },
    pcr,
    reportDate,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "var(--color-overlay)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed",
        inset: "52px",
        zIndex: 9999,
        background: "var(--color-surface)",
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}>

        {/* Modal header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface)",
          flexShrink: 0,
        }}>
          {/* Left — title */}
          <div style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text)",
          }}>
            {campaign.campaign_name}
            <span style={{
              fontSize: 12,
              fontWeight: 400,
              color: "var(--color-text-secondary)",
              marginLeft: 8,
            }}>
              · Post-Campaign Report
            </span>
          </div>

          {/* Right — actions */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <button
              onClick={onOpenSettings}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                height: 30,
                padding: "0 12px",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--color-text-secondary)",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Settings size={11} /> Settings
            </button>
            <button
              onClick={handleExportPdf}
              disabled={pdfLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                height: 30,
                padding: "0 12px",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--color-surface)",
                background: pdfLoading ? "var(--color-text-muted)" : "var(--color-text)",
                border: "none",
                borderRadius: 6,
                cursor: pdfLoading ? "default" : "pointer",
                fontFamily: "inherit",
                opacity: pdfLoading ? 0.7 : 1,
              }}
            >
              <Download size={11} />
              {pdfLoading ? "Generating..." : "Export PDF"}
            </button>
            <button
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                borderRadius: 6,
                background: "transparent",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-muted)",
                cursor: "pointer",
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.background =
                  "var(--color-surface-alt)")
              }
              onMouseLeave={e =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Slides — stacked, scrollable */}
        <div
          ref={slidesRef}
          style={{
            flex: 1,
            overflowY: "auto",
            paddingTop: 20,
            paddingBottom: 20,
            paddingLeft: sidePadding,
            paddingRight: sidePadding,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: "var(--color-surface-alt)",
          }}
        >
          {/* Cover */}
          <div style={{
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 8,
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: BASELINE_W,
              height: BASELINE_H,
              transformOrigin: "top left",
              transform: `scale(${scale})`,
            }}>
              <CoverSlide {...slideProps} heroImage={heroImage} />
            </div>
          </div>

          {/* Overview */}
          <div style={{
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 8,
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: BASELINE_W,
              height: BASELINE_H,
              transformOrigin: "top left",
              transform: `scale(${scale})`,
            }}>
              <OverviewSlide {...slideProps} heroImage={overviewImage} pcrConfig={pcrConfig ?? null} />
            </div>
          </div>

          {/* Activity */}
          <div style={{
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 8,
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: BASELINE_W,
              height: BASELINE_H,
              transformOrigin: "top left",
              transform: `scale(${scale})`,
            }}>
              <ActivitySlide {...slideProps} suburbs={suburbs} heatmapData={heatmapData} />
            </div>
          </div>

          {/* Audience */}
          <div style={{
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 8,
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: BASELINE_W,
              height: BASELINE_H,
              transformOrigin: "top left",
              transform: `scale(${scale})`,
            }}>
              <AudienceSlide {...slideProps} demographics={demographics} />
            </div>
          </div>

          {/* Personas */}
          <div style={{
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 8,
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: BASELINE_W,
              height: BASELINE_H,
              transformOrigin: "top left",
              transform: `scale(${scale})`,
            }}>
              <PersonasSlide {...slideProps} />
            </div>
          </div>

          {/* Gallery slides */}
          {galleryImages.map((image, i) => (
            <div key={image.id} style={{
              width: "100%",
              aspectRatio: "16 / 9",
              borderRadius: 8,
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}>
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: BASELINE_W,
                height: BASELINE_H,
                transformOrigin: "top left",
                transform: `scale(${scale})`,
              }}>
                <GallerySlide
                  {...slideProps}
                  image={image}
                  slideNumber={i + 1}
                  totalImages={galleryImages.length}
                />
              </div>
            </div>
          ))}

          {/* Close */}
          <div style={{
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 8,
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
          }}>
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: BASELINE_W,
              height: BASELINE_H,
              transformOrigin: "top left",
              transform: `scale(${scale})`,
            }}>
              <CloseSlide {...slideProps} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
