"use client";

import SlideWrapper from "../SlideWrapper";
import { SlideProps, PopImage } from "../types";

interface GallerySlideProps extends SlideProps {
  image: PopImage;
  slideNumber: number;
  totalImages: number;
}

export default function GallerySlide({
  theme, campaign, pcr, reportDate,
  image, slideNumber, totalImages
}: GallerySlideProps) {
  const primary = theme.primary_colour ?? "#95bbc1";

  return (
    <SlideWrapper theme={theme} label="Gallery" reportDate={reportDate}>
      {/* Left */}
      <div style={{
        flex: "0 0 30%",
        padding: "3.5% 2% 3.5% 3.5%",
        display: "flex", flexDirection: "column",
        justifyContent: "center",
      }}>
        <div style={{
          fontSize: "clamp(22px, 4vw, 48px)",
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
          marginBottom: "4%",
        }}>
          Campaign<br />Gallery
        </div>
        {image.location && (
          <div style={{
            fontSize: "clamp(7px, 0.85vw, 9px)",
            color: primary, marginBottom: "2%",
          }}>
            {image.location}
          </div>
        )}
        {image.captured_at && (
          <div style={{
            fontSize: "clamp(7px, 0.85vw, 9px)",
            color: "rgba(255,255,255,0.25)",
          }}>
            {new Date(image.captured_at).toLocaleDateString("en-AU", {
              day: "numeric", month: "short", year: "numeric"
            })}
          </div>
        )}
        <div style={{
          marginTop: "auto",
          fontSize: "clamp(7px, 0.85vw, 9px)",
          color: "rgba(255,255,255,0.2)",
        }}>
          {slideNumber} / {totalImages}
        </div>
      </div>

      {/* Right — full image */}
      <div style={{
        flex: 1,
        padding: "3.5% 3.5% 3.5% 0",
      }}>
        <div style={{
          width: "100%", height: "100%",
          borderRadius: 10, overflow: "hidden",
          position: "relative",
        }}>
          <img
            src={image.url}
            alt={image.title}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Arrow indicator */}
          <div style={{
            position: "absolute", bottom: "3%", right: "3%",
            opacity: 0.4,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8 4l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <path d="M4 4l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </SlideWrapper>
  );
}
