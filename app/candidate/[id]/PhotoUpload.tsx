"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PhotoUploadProps = {
  candidateId: string;
  firstName: string;
  currentPhotoUrl: string | null;
};

export default function PhotoUpload({
  candidateId,
  firstName,
  currentPhotoUrl,
}: PhotoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(
    currentPhotoUrl
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          uploadResult.error || "Failed to upload image."
        );
      }

      // 2. Save Cloudinary URL to this candidate
      const updateResponse = await fetch(
        `/api/candidates/${candidateId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            photoUrl: uploadResult.url,
          }),
        }
      );

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(
          updateResult.error || "Failed to save profile photo."
        );
      }

      setPreview(uploadResult.url);
      setSuccess("Profile photo updated successfully.");

      router.refresh();
    } catch (error) {
      console.error("Photo upload error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading."
      );

      setPreview(currentPhotoUrl);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="shrink-0">
      <div className="relative">
        {preview ? (
          <img
            src={preview}
            alt={`${firstName}'s profile`}
            className="h-32 w-32 rounded-[24px] object-cover ring-4 ring-[#fdf1f3] sm:h-36 sm:w-36 md:h-40 md:w-40"
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-[24px] bg-[#fdf1f3] text-5xl ring-4 ring-[#fdf1f3] sm:h-36 sm:w-36 md:h-40 md:w-40">
            👤
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[24px] bg-[#2a1626]/75 text-white">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/30 border-t-white" />

            <span className="mt-2 text-xs font-semibold">
              Uploading...
            </span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          className="hidden"
          disabled={uploading}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-xl bg-[#2a1626] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#3c2138] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading
            ? "Uploading..."
            : currentPhotoUrl
            ? "Replace photo"
            : "Upload photo"}
        </button>

        <p className="mt-2 text-[11px] text-[#6b5566]">
          JPG, PNG or WEBP · max 5MB
        </p>

        {success && (
          <p className="mt-2 text-xs font-semibold text-[#1b6b3a]">
            ✓ {success}
          </p>
        )}

        {error && (
          <p className="mt-2 max-w-xs text-xs font-semibold text-[#d9364f]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}