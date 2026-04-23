"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { X, ChevronLeft, ChevronRight, Settings, Download } from "lucide-react";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
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

  const [slide, setSlide] = useState(0);

  // Fetch supporting data
  const { data: theme } = useSWR<OrgTheme>(
    token ? ["/v2/organisation/theme", token] : null, fetcher
  );
  const { data: suburbs = [] } = useSWR<SuburbData[]>(
    token && campaignId ? [`/v2/campaign/${campaignId}/suburbs`, token] : null, fetcher
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

  console.log('pcrConfig:', pcrConfig);
  console.log('pcrConfig?.cpm:', pcrConfig?.cpm);

  // Determine gallery images — use config selection if set, else all pops
  const galleryImages: PopImage[] = pcrConfig?.gallery_image_ids?.length
    ? allPops.filter(p => pcrConfig.gallery_image_ids.includes(p.id))
    : allPops;

  const heroImage = pcrConfig?.cover_image_id
    ? allPops.find(p => p.id === pcrConfig.cover_image_id) ?? allPops[0] ?? null
    : allPops[0] ?? null;

  // Build slide list dynamically
  const slides = [
    "cover",
    "overview",
    "activity",
    "audience",
    "personas",
    ...galleryImages.map((_, i) => `gallery-${i}`),
    "close",
  ];

  const total = slides.length;

  const prev = useCallback(() => setSlide(s => Math.max(0, s - 1)), []);
  const next = useCallback(() => setSlide(s => Math.min(total - 1, s + 1)), [total]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, prev, next, onClose]);

  // Reset to first slide when opened
  useEffect(() => { if (open) setSlide(0); }, [open]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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

  function renderSlide() {
    const current = slides[slide];
    if (current === "cover") return <CoverSlide {...slideProps} heroImage={heroImage} />;
    if (current === "overview") return <OverviewSlide {...slideProps} heroImage={heroImage} pcrConfig={pcrConfig ?? null} />;
    if (current === "activity") return <ActivitySlide {...slideProps} suburbs={suburbs} />;
    if (current === "audience") return <AudienceSlide {...slideProps} demographics={demographics} />;
    if (current === "personas") return <PersonasSlide {...slideProps} />;
    if (current === "close") return <CloseSlide {...slideProps} />;
    if (current?.startsWith("gallery-")) {
      const idx = parseInt(current.split("-")[1]);
      return (
        <GallerySlide
          {...slideProps}
          image={galleryImages[idx]}
          slideNumber={idx + 1}
          totalImages={galleryImages.length}
        />
      );
    }
    return null;
  }

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
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                height: 30,
                padding: "0 12px",
                fontSize: 11,
                fontWeight: 500,
                color: "var(--color-surface)",
                background: "var(--color-text)",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Download size={11} /> Export PDF
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

        {/* Slide area — dark bg, centred 16:9 canvas */}
        <div style={{
          flex: 1,
          minHeight: 0,
          background: "var(--color-surface-alt)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 40px",
          gap: 16,
        }}>
          {/* 16:9 slide */}
          <div style={{
            width: "100%",
            flex: 1,
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              height: "100%",
              maxHeight: "100%",
              aspectRatio: "16 / 9",
              maxWidth: "100%",
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}>
              {renderSlide()}
            </div>
          </div>

          {/* Navigation row */}
          <div style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            {/* Prev */}
            <button
              onClick={prev}
              disabled={slide === 0}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                height: 30,
                padding: "0 14px",
                fontSize: 11,
                fontWeight: 500,
                color: slide === 0
                  ? "var(--color-text-muted)"
                  : "var(--color-text-secondary)",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                cursor: slide === 0 ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <ChevronLeft size={12} /> Prev
            </button>

            {/* Dots + counter */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{
                    width: i === slide ? 18 : 5,
                    height: 5,
                    borderRadius: 3,
                    background: i === slide
                      ? (activeTheme.primary_colour ?? "#95bbc1")
                      : "var(--color-border)",
                    border: "none",
                    cursor: "pointer",
                    transition: "width 0.2s, background 0.2s",
                    padding: 0,
                  }}
                />
              ))}
              <span style={{
                fontSize: 10,
                color: "var(--color-text-muted)",
                marginLeft: 6,
                fontFamily: "inherit",
              }}>
                {slide + 1} / {total}
              </span>
            </div>

            {/* Next */}
            <button
              onClick={next}
              disabled={slide === total - 1}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                height: 30,
                padding: "0 14px",
                fontSize: 11,
                fontWeight: 500,
                color: slide === total - 1
                  ? "var(--color-text-muted)"
                  : "var(--color-text-secondary)",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                cursor: slide === total - 1 ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              Next <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
