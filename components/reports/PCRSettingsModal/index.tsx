"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import { X, Save } from "lucide-react";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import { uploadFileToS3 } from "@/lib/uploadToS3";
import { OrgTheme, PopImage, PCRConfig } from "@/components/reports/PCRPresentation/types";

type Tab = "theme" | "controls";

interface PCRSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PCRSettingsModal({ open, onClose }: PCRSettingsModalProps) {
  const params = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token = (session?.user as User)?.jwt ?? "";

  const [activeTab, setActiveTab] = useState<Tab>("theme");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch theme
  const { data: theme } = useSWR<OrgTheme>(
    token ? ["/v2/organisation/theme", token] : null, fetcher
  );

  // Fetch pops for gallery selection
  const { data: popsData } = useSWR<PopImage[]>(
    token && campaignId ? [`/v2/campaign/${campaignId}/pops`, token] : null, fetcher
  );

  // Fetch pcr config
  const { data: pcrConfig } = useSWR<PCRConfig>(
    token && campaignId ? [`/v2/campaign/${campaignId}/pcr-config`, token] : null, fetcher
  );

  const allPops = popsData ?? [];

  // Local theme edit state
  const [themeEdit, setThemeEdit] = useState<Partial<OrgTheme>>({});
  const [phoneNumbers, setPhoneNumbers] = useState<{ label: string; number: string }[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<number[]>([]);

  // Sync from fetched data
  useEffect(() => {
    if (!theme) return;
    setThemeEdit({
      logo_url: theme.logo_url ?? "",
      primary_colour: theme.primary_colour,
      secondary_colour: theme.secondary_colour,
      presentation_bg_colour: theme.presentation_bg_colour,
      website: theme.website ?? "",
      brand_statement: theme.brand_statement ?? "",
      cover_tagline: theme.cover_tagline ?? "",
      considerations: theme.considerations ?? "",
    });
    setPhoneNumbers(theme.phone_numbers ?? []);
  }, [theme]);

  useEffect(() => {
    if (!pcrConfig) return;
    setSelectedImageIds(pcrConfig.gallery_image_ids ?? []);
  }, [pcrConfig]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const handleThemeChange = (field: keyof OrgTheme, value: string) => {
    setThemeEdit(prev => ({ ...prev, [field]: value }));
  };

  const addPhone = () => setPhoneNumbers(p => [...p, { label: "", number: "" }]);
  const removePhone = (i: number) => setPhoneNumbers(p => p.filter((_, idx) => idx !== i));
  const updatePhone = (i: number, field: "label" | "number", value: string) => {
    setPhoneNumbers(p => p.map((ph, idx) => idx === i ? { ...ph, [field]: value } : ph));
  };

  const toggleImage = (id: number) => {
    setSelectedImageIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === "theme") {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v2/organisation/theme`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...themeEdit, phone_numbers: phoneNumbers }),
        });
        mutate(["/v2/organisation/theme", token]);
      } else {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v2/campaign/${campaignId}/pcr-config`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ gallery_image_ids: selectedImageIds }),
          }
        );
        mutate([`/v2/campaign/${campaignId}/pcr-config`, token]);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(true);
    setLogoError(null);

    try {
      const url = await uploadFileToS3(file, "insiight", token);
      handleThemeChange("logo_url", url);
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLogoUploading(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    if (theme) {
      setThemeEdit(prev => ({ ...prev, logo_url: theme.logo_url ?? "" }));
      setPhoneNumbers(theme.phone_numbers ?? []);
    }
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 34,
    padding: "0 10px",
    fontSize: 12,
    color: "var(--color-text)",
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 6,
    outline: "none",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-secondary)",
    marginBottom: 5,
    display: "block",
  };

  const fieldStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    marginBottom: 16,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          zIndex: 10000,
          background: "var(--color-overlay)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10001,
        width: "min(560px, calc(100vw - 48px))",
        maxHeight: "calc(100vh - 80px)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
        }}>
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: "var(--color-text)",
          }}>
            Presentation Settings
          </span>
          <button
            onClick={onClose}
            style={{
              display: "flex", alignItems: "center",
              justifyContent: "center",
              width: 28, height: 28, borderRadius: 6,
              border: "1px solid var(--color-border)",
              background: "transparent",
              color: "var(--color-text-muted)",
              cursor: "pointer",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid var(--color-border)",
          flexShrink: 0,
          padding: "0 20px",
        }}>
          {([
            { key: "theme", label: "Organisation Theme" },
            { key: "controls", label: "Campaign Controls" },
          ] as { key: Tab; label: string }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 16px",
                fontSize: 12,
                fontWeight: activeTab === tab.key ? 500 : 400,
                color: activeTab === tab.key
                  ? "var(--color-text)"
                  : "var(--color-text-secondary)",
                background: "none",
                border: "none",
                borderBottom: activeTab === tab.key
                  ? "2px solid var(--color-text)"
                  : "2px solid transparent",
                cursor: "pointer",
                marginBottom: -1,
                fontFamily: "inherit",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "20px",
        }}>

          {/* ── THEME TAB ── */}
          {activeTab === "theme" && (
            <div>
              {/* Colours */}
              <div style={{
                fontSize: 10, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: "var(--color-text-muted)",
                marginBottom: 12,
              }}>
                Brand Colours
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                {([
                  { field: "primary_colour", label: "Primary" },
                  { field: "secondary_colour", label: "Secondary" },
                  { field: "presentation_bg_colour", label: "Slide Background" },
                ] as { field: keyof OrgTheme; label: string }[]).map(({ field, label }) => (
                  <div key={field} style={fieldStyle}>
                    <label style={labelStyle}>{label}</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="color"
                        value={(themeEdit[field] as string) ?? "#000000"}
                        onChange={e => handleThemeChange(field, e.target.value)}
                        style={{
                          width: 34, height: 34,
                          borderRadius: 6, border: "1px solid var(--color-border)",
                          padding: 2, cursor: "pointer", background: "none",
                        }}
                      />
                      <input
                        type="text"
                        value={(themeEdit[field] as string) ?? ""}
                        onChange={e => handleThemeChange(field, e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="#000000"
                        maxLength={7}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Logo */}
              <div style={{
                fontSize: 10, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: "var(--color-text-muted)",
                marginBottom: 12,
              }}>
                Branding
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Logo</label>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 16px",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  background: "var(--color-surface-alt)",
                }}>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/avif,image/webp"
                    onChange={handleLogoUpload}
                    style={{ display: "none" }}
                  />

                  {/* Logo preview */}
                  <div style={{
                    width: 80, height: 40,
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden", flexShrink: 0,
                    position: "relative",
                  }}>
                    {logoUploading ? (
                      <div style={{
                        fontSize: 9,
                        color: "var(--color-text-muted)",
                      }}>
                        Uploading...
                      </div>
                    ) : themeEdit.logo_url ? (
                      <>
                        <img
                          src={themeEdit.logo_url as string}
                          alt="Organisation logo"
                          style={{
                            width: "100%", height: "100%",
                            objectFit: "contain", padding: 4,
                          }}
                          onError={e => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = "none";
                            const fallback = img.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "flex";
                          }}
                          onLoad={e => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = "block";
                            const fallback = img.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = "none";
                          }}
                        />
                        <div style={{
                          display: "none",
                          position: "absolute", inset: 0,
                          alignItems: "center", justifyContent: "center",
                          fontSize: 9,
                          color: "var(--color-text-muted)",
                          textAlign: "center",
                          padding: "0 4px",
                        }}>
                          No logo
                        </div>
                      </>
                    ) : (
                      <span style={{
                        fontSize: 9,
                        color: "var(--color-text-muted)",
                        textAlign: "center",
                        padding: "0 4px",
                      }}>
                        No logo
                      </span>
                    )}
                  </div>

                  {/* Upload button + info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 11,
                      color: "var(--color-text-secondary)",
                      marginBottom: 8, lineHeight: 1.4,
                    }}>
                      {themeEdit.logo_url
                        ? "Logo uploaded. Click to replace."
                        : "Upload your organisation logo."}
                      {" "}PNG, SVG, AVIF or WebP — max 5MB.
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={logoUploading}
                      style={{
                        height: 28, padding: "0 12px",
                        fontSize: 11, fontWeight: 500,
                        color: "var(--color-text-secondary)",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 6,
                        cursor: logoUploading ? "default" : "pointer",
                        opacity: logoUploading ? 0.6 : 1,
                        fontFamily: "inherit",
                      }}
                    >
                      {logoUploading ? "Uploading..." : themeEdit.logo_url ? "Change Logo" : "Upload Logo"}
                    </button>
                    {logoError && (
                      <div style={{
                        fontSize: 11,
                        color: "var(--color-error)",
                        marginTop: 6,
                      }}>
                        {logoError}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Website</label>
                <input
                  type="text"
                  value={(themeEdit.website as string) ?? ""}
                  onChange={e => handleThemeChange("website", e.target.value)}
                  style={inputStyle}
                  placeholder="www.yourwebsite.com.au"
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Cover Tagline</label>
                <input
                  type="text"
                  value={(themeEdit.cover_tagline as string) ?? ""}
                  onChange={e => handleThemeChange("cover_tagline", e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. Powered by Acme Media"
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Brand Statement</label>
                <textarea
                  value={(themeEdit.brand_statement as string) ?? ""}
                  onChange={e => handleThemeChange("brand_statement", e.target.value)}
                  style={{
                    ...inputStyle,
                    height: 72,
                    padding: "8px 10px",
                    resize: "none",
                    lineHeight: 1.5,
                  }}
                  placeholder="A short description of your organisation..."
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Considerations</label>
                <textarea
                  value={(themeEdit.considerations as string) ?? ""}
                  onChange={e => handleThemeChange("considerations", e.target.value)}
                  style={{
                    ...inputStyle,
                    height: 100,
                    padding: "8px 10px",
                    resize: "none",
                    lineHeight: 1.5,
                  }}
                  placeholder="Add any notes or legal considerations..."
                />
              </div>

              {/* Phone numbers */}
              <div style={{
                fontSize: 10, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: "var(--color-text-muted)",
                marginBottom: 12,
              }}>
                Phone Numbers
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
                {phoneNumbers.map((ph, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="text"
                      value={ph.label}
                      onChange={e => updatePhone(i, "label", e.target.value)}
                      style={{ ...inputStyle, width: 90, flex: "0 0 90px" }}
                      placeholder="Label (e.g. mel, syd, mobile)"
                    />
                    <input
                      type="text"
                      value={ph.number}
                      onChange={e => updatePhone(i, "number", e.target.value)}
                      style={{ ...inputStyle, flex: 1 }}
                      placeholder="03 8844 4822"
                    />
                    <button
                      onClick={() => removePhone(i)}
                      style={{
                        width: 28, height: 28, borderRadius: 6,
                        border: "1px solid var(--color-border)",
                        background: "transparent",
                        color: "var(--color-text-muted)",
                        cursor: "pointer",
                        flexShrink: 0,
                        display: "flex", alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addPhone}
                style={{
                  height: 30, padding: "0 12px",
                  fontSize: 11, fontWeight: 500,
                  color: "var(--color-text-secondary)",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6, cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                + Add phone number
              </button>
            </div>
          )}

          {/* ── CAMPAIGN CONTROLS TAB ── */}
          {activeTab === "controls" && (
            <div>
              <div style={{
                fontSize: 10, fontWeight: 600,
                letterSpacing: "0.08em", textTransform: "uppercase",
                color: "var(--color-text-muted)",
                marginBottom: 4,
              }}>
                Gallery Images
              </div>
              <div style={{
                fontSize: 11, color: "var(--color-text-secondary)",
                marginBottom: 16, lineHeight: 1.5,
              }}>
                Select which proof of play images appear in the presentation gallery.
                If none are selected, all images will be shown.
              </div>

              {allPops.length === 0 ? (
                <div style={{
                  padding: "32px 24px",
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}>
                  No proof of play images uploaded for this campaign yet.
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8,
                }}>
                  {allPops.map(pop => {
                    const selected = selectedImageIds.includes(pop.id);
                    return (
                      <div
                        key={pop.id}
                        onClick={() => toggleImage(pop.id)}
                        style={{
                          position: "relative",
                          borderRadius: 8,
                          overflow: "hidden",
                          border: selected
                            ? "2px solid var(--color-text)"
                            : "2px solid var(--color-border)",
                          cursor: "pointer",
                          aspectRatio: "16 / 9",
                        }}
                      >
                        <img
                          src={pop.url}
                          alt={pop.title}
                          style={{
                            width: "100%", height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        {selected && (
                          <div style={{
                            position: "absolute",
                            top: 6, right: 6,
                            width: 18, height: 18,
                            borderRadius: "50%",
                            background: "var(--color-text)",
                            display: "flex", alignItems: "center",
                            justifyContent: "center",
                          }}>
                            <svg width="10" height="10" viewBox="0 0 10 10">
                              <path d="M2 5l2.5 2.5L8 3"
                                stroke="var(--color-surface)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                fill="none"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "flex-end", gap: 8,
          padding: "12px 20px",
          borderTop: "1px solid var(--color-border)",
          flexShrink: 0,
        }}>
          <button
            onClick={handleCancel}
            style={{
              height: 32, padding: "0 14px",
              fontSize: 12, fontWeight: 500,
              color: "var(--color-text-secondary)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 7, cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              height: 32, padding: "0 14px",
              fontSize: 12, fontWeight: 500,
              color: "var(--color-surface)",
              background: "var(--color-text)",
              border: "none",
              borderRadius: 7, cursor: saving ? "default" : "pointer",
              opacity: saving ? 0.6 : 1,
              display: "inline-flex", alignItems: "center", gap: 6,
              fontFamily: "inherit",
            }}
          >
            <Save size={11} />
            {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}
