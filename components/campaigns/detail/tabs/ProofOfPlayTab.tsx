"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import { Upload, Link2, Pencil, X, ExternalLink, Plus, Trash2 } from "lucide-react";
import heic2any from "heic2any";
import { toast } from "sonner";
import { User } from "@/constants/types";
import { fetcher } from "@/lib/swrFetchers";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/constants/config";
import apiClient from "@/lib/config";
import SectionCard from "@/components/campaigns/detail/SectionCard";

type PopImage = {
  id: number;
  campaign_id: string;
  asset_id: string | null;
  url: string;
  title: string;
  description: string | null;
  location: string | null;
  captured_at: string | null;
  time_uploaded: string;
};

type DriveLink = {
  id: number;
  campaign_id: string;
  label: string;
  url: string;
  added_by: string;
  created_at: string;
};

export default function ProofOfPlayTab() {
  const params = useParams();
  const campaignId = params.campaign_id as string;
  const { data: session } = useSession();
  const token = (session?.user as User)?.jwt ?? "";
  const { hasPermission, hasPermissionsLoaded } = usePermissions();
  const canManage = hasPermissionsLoaded && hasPermission(PERMISSIONS.POPS_MANAGE);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editingPop, setEditingPop] = useState<PopImage | null>(null);
  const [editForm, setEditForm] = useState({
    title: "", description: "", location: "", asset_id: "", captured_at: "",
  });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ label: "", url: "" });
  const [savingLink, setSavingLink] = useState(false);

  const { data: pops = [], isLoading: popsLoading } = useSWR<PopImage[]>(
    token && campaignId ? [`/v2/campaign/${campaignId}/pops`, token] : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: driveLinks = [], isLoading: linksLoading } = useSWR<DriveLink[]>(
    token && campaignId ? [`/v2/campaign/${campaignId}/drive-links`, token] : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const headers = { Authorization: `Bearer ${token}` };

  // ── Upload handler ────────────────────────────────────────────
  const handleFiles = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        let uploadFile: File | Blob = file;

        // Convert HEIC to JPEG client-side
        const isHeic =
          file.type === "image/heic" ||
          file.type === "image/heif" ||
          file.name.toLowerCase().endsWith(".heic") ||
          file.name.toLowerCase().endsWith(".heif");

        if (isHeic) {
          const converted = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.9,
          });
          uploadFile = Array.isArray(converted)
            ? converted[0]
            : converted;
        }

        const formData = new FormData();
        formData.append("file", uploadFile,
          file.name.replace(/\.heic$/i, ".jpg")
            .replace(/\.heif$/i, ".jpg")
        );

        const uploadRes = await apiClient.post(
          `/v2/campaign/${campaignId}/pops/upload`,
          formData,
          { headers: { ...headers, "Content-Type": "multipart/form-data" } }
        );
        const { url } = uploadRes.data.data;

        // Create DB record with filename as default title
        const title = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
        await apiClient.post(
          `/v2/campaign/${campaignId}/pops`,
          { url, title },
          { headers }
        );

        toast.success(`${file.name} uploaded`);
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}`);
        console.error(err);
      }
    }

    setUploading(false);
    mutate([`/v2/campaign/${campaignId}/pops`, token]);
  };

  // ── Edit metadata ─────────────────────────────────────────────
  const openEdit = (pop: PopImage) => {
    setEditingPop(pop);
    setEditForm({
      title: pop.title ?? "",
      description: pop.description ?? "",
      location: pop.location ?? "",
      asset_id: pop.asset_id ?? "",
      captured_at: pop.captured_at
        ? new Date(pop.captured_at).toISOString().slice(0, 16)
        : "",
    });
  };

  const saveEdit = async () => {
    if (!editingPop) return;
    try {
      await apiClient.put(
        `/v2/campaign/${campaignId}/pops/${editingPop.id}`,
        {
          title: editForm.title,
          description: editForm.description || null,
          location: editForm.location || null,
          asset_id: editForm.asset_id || null,
          captured_at: editForm.captured_at || null,
        },
        { headers }
      );
      toast.success("Metadata saved");
      setEditingPop(null);
      mutate([`/v2/campaign/${campaignId}/pops`, token]);
    } catch {
      toast.error("Failed to save metadata");
    }
  };

  const deletePop = async (pop: PopImage) => {
    if (!confirm(`Delete "${pop.title}"? This cannot be undone.`)) return;
    try {
      await apiClient.delete(
        `/v2/campaign/${campaignId}/pops/${pop.id}`,
        { headers }
      );
      toast.success("Image deleted");
      mutate([`/v2/campaign/${campaignId}/pops`, token]);
    } catch {
      toast.error("Failed to delete image");
    }
  };

  // ── Drive link ────────────────────────────────────────────────
  const saveLink = async () => {
    if (!linkForm.url) return;
    setSavingLink(true);
    try {
      await apiClient.post(
        `/v2/campaign/${campaignId}/drive-links`,
        { label: linkForm.label || "Drive Link", url: linkForm.url },
        { headers }
      );
      toast.success("Drive link added");
      setShowLinkModal(false);
      setLinkForm({ label: "", url: "" });
      mutate([`/v2/campaign/${campaignId}/drive-links`, token]);
    } catch {
      toast.error("Failed to add link");
    } finally {
      setSavingLink(false);
    }
  };

  const deleteLink = async (id: number) => {
    try {
      await apiClient.delete(
        `/v2/campaign/${campaignId}/drive-links/${id}`,
        { headers }
      );
      mutate([`/v2/campaign/${campaignId}/drive-links`, token]);
    } catch {
      toast.error("Failed to delete link");
    }
  };

  // ── Field style helpers ───────────────────────────────────────
  const fieldStyle: React.CSSProperties = {
    display: "flex", flexDirection: "column", gap: 4, marginBottom: 12,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)",
    textTransform: "uppercase", letterSpacing: "0.06em",
  };
  const inputStyle: React.CSSProperties = {
    fontSize: 13, padding: "8px 10px",
    border: "1px solid var(--color-border)",
    borderRadius: 6, background: "var(--color-surface-alt)",
    color: "var(--color-text)", fontFamily: "inherit", outline: "none",
    width: "100%", boxSizing: "border-box" as const,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Drive links — only if links exist or can manage ── */}
      {(driveLinks.length > 0 || (canManage && !linksLoading)) && (
        <SectionCard
          title="Drive Links"
          subtitle="Shared drives linked to this campaign"
          action={canManage ? (
            <button
              onClick={() => setShowLinkModal(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                height: 28, padding: "0 10px", fontSize: 11, fontWeight: 500,
                color: "var(--color-text-secondary)",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <Link2 size={11} /> Link Drive
            </button>
          ) : undefined}
        >
          {linksLoading ? (
            <div style={{ height: 40, background: "var(--color-border)", borderRadius: 6, animation: "pulse 1.5s ease-in-out infinite" }} />
          ) : driveLinks.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              No drive links added yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {driveLinks.map(link => (
                <div key={link.id} style={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", gap: 12,
                  padding: "8px 12px",
                  background: "var(--color-surface-alt)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <Link2 size={13} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text)", marginBottom: 1 }}>
                        {link.label}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {link.url}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, borderRadius: 6,
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-secondary)",
                        background: "var(--color-surface)",
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={12} />
                    </a>
                    {canManage && (
                      <button
                        onClick={() => deleteLink(link.id)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center",
                          width: 28, height: 28, borderRadius: 6,
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text-muted)",
                          background: "var(--color-surface)",
                          cursor: "pointer",
                        }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* ── Proof of Play ── */}
      <SectionCard
        title="Proof of Play"
        subtitle="Campaign imagery and field documentation"
        action={canManage ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                height: 28, padding: "0 10px", fontSize: 11, fontWeight: 500,
                color: "var(--color-surface)",
                background: uploading ? "var(--color-text-muted)" : "var(--color-text)",
                border: "none", borderRadius: 6,
                cursor: uploading ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <Upload size={11} />
              {uploading ? "Uploading..." : "Upload"}
              <Plus size={10} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.heic,.HEIC"
              multiple
              style={{ display: "none" }}
              onChange={e => e.target.files && handleFiles(e.target.files)}
            />
          </div>
        ) : undefined}
      >
        {popsLoading ? (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
          }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{
                aspectRatio: "4/3",
                background: "var(--color-border)",
                borderRadius: 8,
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
            ))}
          </div>
        ) : pops.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "48px 0", gap: 8,
          }}>
            <Upload size={24} style={{ color: "var(--color-text-muted)" }} />
            <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
              No proof of play images yet
            </div>
            {canManage && (
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  marginTop: 4, fontSize: 12, fontWeight: 500,
                  color: "var(--color-text)",
                  background: "transparent", border: "none",
                  cursor: "pointer", textDecoration: "underline",
                  fontFamily: "inherit",
                }}
              >
                Upload the first image
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
          }}>
            {pops.map(pop => (
              <div
                key={pop.id}
                style={{
                  position: "relative",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "var(--color-surface-alt)",
                  border: "1px solid var(--color-border)",
                  cursor: "default",
                }}
                className="pop-card"
              >
                {/* Image */}
                <div style={{ aspectRatio: "4/3", overflow: "hidden" }}>
                  <img
                    src={pop.url}
                    alt={pop.title}
                    style={{
                      width: "100%", height: "100%",
                      objectFit: "cover", display: "block",
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ padding: "8px 10px" }}>
                  <div style={{
                    fontSize: 12, fontWeight: 500,
                    color: "var(--color-text)",
                    overflow: "hidden", textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {pop.title}
                  </div>
                  {pop.asset_id && (
                    <div style={{
                      fontSize: 11, color: "var(--color-text-muted)",
                      marginTop: 2,
                    }}>
                      {pop.asset_id}
                    </div>
                  )}
                </div>

                {/* Hover edit/delete buttons */}
                {canManage && (
                  <div
                    className="pop-edit-btn"
                    style={{
                      position: "absolute",
                      top: 8, right: 8,
                      display: "flex",
                      gap: 4,
                      opacity: 0,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <button
                      onClick={() => openEdit(pop)}
                      style={{
                        width: 28, height: 28,
                        borderRadius: 6,
                        background: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(4px)",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => deletePop(pop)}
                      style={{
                        width: 28, height: 28,
                        borderRadius: 6,
                        background: "rgba(220,38,38,0.7)",
                        backdropFilter: "blur(4px)",
                        border: "none",
                        color: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ── Edit metadata modal ── */}
      {editingPop && (
        <>
          <div
            onClick={() => setEditingPop(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 9998,
              background: "var(--color-overlay)",
            }}
          />
          <div style={{
            position: "fixed",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            width: 440,
            padding: "24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 20,
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>
                Edit Image Details
              </div>
              <button
                onClick={() => setEditingPop(null)}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  border: "1px solid var(--color-border)",
                  background: "transparent", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-text-muted)",
                }}
              >
                <X size={13} />
              </button>
            </div>

            {/* Preview */}
            <div style={{
              width: "100%", aspectRatio: "16/9",
              borderRadius: 8, overflow: "hidden",
              marginBottom: 16,
              background: "var(--color-surface-alt)",
            }}>
              <img
                src={editingPop.url}
                alt={editingPop.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Title *</label>
              <input
                style={inputStyle}
                value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Perth CBD corner shot"
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Asset ID</label>
              <input
                style={inputStyle}
                value={editForm.asset_id}
                onChange={e => setEditForm(f => ({ ...f, asset_id: e.target.value }))}
                placeholder="e.g. HYPED4"
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Location</label>
              <input
                style={inputStyle}
                value={editForm.location}
                onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Murray St & Barrack St, Perth"
              />
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Captured At</label>
              <input
                type="datetime-local"
                style={inputStyle}
                value={editForm.captured_at}
                onChange={e => setEditForm(f => ({ ...f, captured_at: e.target.value }))}
              />
            </div>

            <div style={{ ...fieldStyle, marginBottom: 0 }}>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional notes about this image"
              />
            </div>

            <div style={{
              display: "flex", justifyContent: "flex-end", gap: 8,
              marginTop: 20,
            }}>
              <button
                onClick={() => setEditingPop(null)}
                style={{
                  height: 32, padding: "0 14px", fontSize: 12, fontWeight: 500,
                  color: "var(--color-text-secondary)",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                style={{
                  height: 32, padding: "0 14px", fontSize: 12, fontWeight: 500,
                  color: "var(--color-surface)",
                  background: "var(--color-text)",
                  border: "none", borderRadius: 6,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Add drive link modal ── */}
      {showLinkModal && (
        <>
          <div
            onClick={() => setShowLinkModal(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9998,
              background: "var(--color-overlay)",
            }}
          />
          <div style={{
            position: "fixed",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            width: 400,
            padding: "24px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 20,
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>
                Link Drive
              </div>
              <button
                onClick={() => setShowLinkModal(false)}
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  border: "1px solid var(--color-border)",
                  background: "transparent", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-text-muted)",
                }}
              >
                <X size={13} />
              </button>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle}>Label</label>
              <input
                style={inputStyle}
                value={linkForm.label}
                onChange={e => setLinkForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Campaign Assets"
              />
            </div>

            <div style={{ ...fieldStyle, marginBottom: 0 }}>
              <label style={labelStyle}>Drive URL *</label>
              <input
                style={inputStyle}
                value={linkForm.url}
                onChange={e => setLinkForm(f => ({ ...f, url: e.target.value }))}
                placeholder="Paste OneDrive, Google Drive or Dropbox link"
              />
            </div>

            <div style={{
              display: "flex", justifyContent: "flex-end", gap: 8,
              marginTop: 20,
            }}>
              <button
                onClick={() => setShowLinkModal(false)}
                style={{
                  height: 32, padding: "0 14px", fontSize: 12, fontWeight: 500,
                  color: "var(--color-text-secondary)",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveLink}
                disabled={!linkForm.url || savingLink}
                style={{
                  height: 32, padding: "0 14px", fontSize: 12, fontWeight: 500,
                  color: "var(--color-surface)",
                  background: !linkForm.url || savingLink
                    ? "var(--color-text-muted)"
                    : "var(--color-text)",
                  border: "none", borderRadius: 6,
                  cursor: !linkForm.url || savingLink ? "default" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {savingLink ? "Saving..." : "Add Link"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── CSS for hover edit button ── */}
      <style>{`
        .pop-card:hover .pop-edit-btn { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
