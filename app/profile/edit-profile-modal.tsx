"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Trash2, Upload, Twitter, Instagram, Globe } from "lucide-react";
import { PictoModule, PictoText } from "@/components/picto";
import { updateProfile, uploadProfileImage } from "./actions";
import { LeaveClashModal } from "./leave-clash-modal";
import { DeleteAccountModal } from "./delete-account-modal";
import type { SocialLink } from "@/lib/schema";

// Icons for known platforms
const platformIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter size={16} />,
  instagram: <Instagram size={16} />,
  website: <Globe size={16} />,
  bluesky: <span className="text-xs font-bold">BS</span>,
  tumblr: <span className="text-xs font-bold">T</span>,
  deviantart: <span className="text-xs font-bold">DA</span>,
};

const knownPlatforms = [
  { value: "twitter", label: "Twitter/X" },
  { value: "instagram", label: "Instagram" },
  { value: "bluesky", label: "Bluesky" },
  { value: "tumblr", label: "Tumblr" },
  { value: "deviantart", label: "DeviantArt" },
  { value: "website", label: "Website" },
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    display_name: string | null;
    pronouns: string | null;
    bio: string | null;
    profile_image_url: string | null;
    social_links: SocialLink[];
  };
  teamColor: string;
  hasTeam: boolean;
  totalPoints: number;
  onSuccess: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  teamColor,
  hasTeam,
  totalPoints,
  onSuccess,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(initialData.display_name || "");
  const [pronouns, setPronouns] = useState(initialData.pronouns || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    initialData.social_links || []
  );
  const [profileImageUrl, setProfileImageUrl] = useState(initialData.profile_image_url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account action modals
  const [isLeaveClashOpen, setIsLeaveClashOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await updateProfile({
      display_name: displayName || null,
      pronouns: pronouns || null,
      bio: bio || null,
      social_links: socialLinks.filter((link) => link.url.trim() !== ""),
    });

    setIsSubmitting(false);

    if (result.success) {
      onSuccess();
      onClose();
    } else {
      setError(result.error || "Failed to update profile");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadProfileImage(formData);

    setIsUploading(false);

    if (result.success && result.url) {
      setProfileImageUrl(result.url);
    } else {
      setError(result.error || "Failed to upload image");
    }
  };

  const addSocialLink = () => {
    if (socialLinks.length >= 10) return;
    setSocialLinks([...socialLinks, { platform: "website", url: "" }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: "platform" | "url", value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  };

  const bioLength = bio.length;
  const bioMaxLength = 500;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <PictoModule className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <PictoText size="xl" weight="bold" color="white">
              Edit Profile
            </PictoText>
            <button
              type="button"
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Profile Image */}
          <div className="mb-6">
            <PictoText size="sm" muted className="block mb-2">
              Profile Image
            </PictoText>
            <div className="flex items-center gap-4">
              <div
                className="w-24 h-24 border-2 bg-[#333] flex-shrink-0 overflow-hidden"
                style={{ borderColor: teamColor }}
              >
                {profileImageUrl ? (
                  <Image
                    src={profileImageUrl}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    <Upload size={24} />
                  </div>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 font-mono font-bold text-sm uppercase transition-colors"
                  style={{
                    backgroundColor: teamColor,
                    color: "#202020",
                    opacity: isUploading ? 0.5 : 1,
                  }}
                >
                  {isUploading ? "Uploading..." : "Upload Image"}
                </button>
                <PictoText size="xs" muted className="block mt-2">
                  Max 5MB. JPEG, PNG, WebP, or GIF.
                </PictoText>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div className="mb-4">
            <label className="block">
              <PictoText size="sm" muted className="block mb-2">
                Display Name
              </PictoText>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                className="w-full px-3 py-2 bg-[#333] border border-white/20 text-white font-mono focus:outline-none focus:border-white/40"
                placeholder="Your display name"
              />
            </label>
          </div>

          {/* Pronouns */}
          <div className="mb-4">
            <label className="block">
              <PictoText size="sm" muted className="block mb-2">
                Pronouns
              </PictoText>
              <input
                type="text"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                maxLength={30}
                className="w-full px-3 py-2 bg-[#333] border border-white/20 text-white font-mono focus:outline-none focus:border-white/40"
                placeholder="e.g., she/her, he/him, they/them"
              />
            </label>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block">
              <div className="flex justify-between items-center mb-2">
                <PictoText size="sm" muted>
                  Bio
                </PictoText>
                <PictoText
                  size="xs"
                  muted
                  style={{ color: bioLength > bioMaxLength ? "#ff4444" : undefined }}
                >
                  {bioLength}/{bioMaxLength}
                </PictoText>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={bioMaxLength}
                rows={4}
                className="w-full px-3 py-2 bg-[#333] border border-white/20 text-white font-mono focus:outline-none focus:border-white/40 resize-none"
                placeholder="Tell us about yourself..."
              />
            </label>
          </div>

          {/* Social Links */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <PictoText size="sm" muted>
                Social Links
              </PictoText>
              <PictoText size="xs" muted>
                {socialLinks.length}/10
              </PictoText>
            </div>

            <div className="space-y-2">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={link.platform}
                    onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                    className="px-2 py-2 bg-[#333] border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-white/40"
                  >
                    {knownPlatforms.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#333] border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-white/40"
                    placeholder="https://"
                  />
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="p-2 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {socialLinks.length < 10 && (
              <button
                type="button"
                onClick={addSocialLink}
                className="mt-2 flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white font-mono text-sm uppercase transition-colors"
              >
                <Plus size={16} />
                Add Link
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40">
              <PictoText size="sm" color="white">
                {error}
              </PictoText>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 font-mono font-bold text-sm uppercase text-white border border-white/30 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 font-mono font-bold text-sm uppercase transition-colors disabled:opacity-50"
              style={{
                backgroundColor: teamColor,
                color: "#202020",
              }}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-white/10" />

          {/* Account Actions */}
          <div className="space-y-3">
            {!hasTeam ? (
              <Link
                href="/event"
                className="block w-full px-4 py-3 font-mono font-bold text-sm uppercase text-center transition-colors"
                style={{
                  backgroundColor: teamColor,
                  color: "#202020",
                }}
                onClick={onClose}
              >
                Join the Clash
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsLeaveClashOpen(true)}
                className="w-full px-4 py-3 font-mono font-bold text-sm uppercase text-[#e91e63] border border-[#e91e63]/30 hover:bg-[#e91e63]/10 transition-colors"
              >
                Leave the Clash
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDeleteAccountOpen(true)}
              className="w-full px-4 py-3 font-mono font-bold text-sm uppercase text-[#e91e63] border border-[#e91e63]/30 hover:bg-[#e91e63]/10 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </form>

        {/* Leave Clash Modal */}
        <LeaveClashModal
          isOpen={isLeaveClashOpen}
          onClose={() => setIsLeaveClashOpen(false)}
          totalPoints={totalPoints}
          teamColor={teamColor}
        />

        {/* Delete Account Modal */}
        <DeleteAccountModal
          isOpen={isDeleteAccountOpen}
          onClose={() => setIsDeleteAccountOpen(false)}
          totalPoints={totalPoints}
          teamColor={teamColor}
        />
      </PictoModule>
    </div>
  );
}

export { platformIcons };
