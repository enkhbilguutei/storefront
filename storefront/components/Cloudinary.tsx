"use client";

import { CldImage, CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

interface CloudinaryImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
}: CloudinaryImageProps) {
  // Check if the src is a Cloudinary URL or a regular URL
  const isCloudinaryUrl = src?.includes("cloudinary.com") || src?.includes("res.cloudinary.com");
  const isPublicId = !src?.includes("/") && !src?.startsWith("http");
  
  if (!src) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  if (isPublicId) {
    return (
      <CldImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    );
  }

  if (isCloudinaryUrl) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    );
  }

  // For non-Cloudinary URLs, use regular img tag
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
    />
  );
}

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
  children: React.ReactNode;
}

export function CloudinaryUpload({ onUpload, children }: CloudinaryUploadProps) {
  return (
    <CldUploadWidget
      uploadPreset="alimhan_preset"
      onSuccess={(result) => {
        if (typeof result.info === "object" && "secure_url" in result.info) {
          onUpload(result.info.secure_url);
        }
      }}
    >
      {({ open }) => (
        <button type="button" onClick={() => open()}>
          {children}
        </button>
      )}
    </CldUploadWidget>
  );
}
