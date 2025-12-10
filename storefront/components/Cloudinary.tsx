"use client";

import { CldImage, CldUploadWidget } from "next-cloudinary";
import Image from "next/image";

interface CloudinaryImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  fill = false,
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
        style={fill ? undefined : { width, height }}
      >
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  if (isPublicId) {
    if (fill) {
      return (
        <CldImage
          src={src}
          alt={alt}
          fill
          className={className}
          priority={priority}
        />
      );
    }
    return (
      <CldImage
        src={src}
        alt={alt}
        width={width!}
        height={height!}
        className={className}
        priority={priority}
      />
    );
  }

  if (isCloudinaryUrl) {
    if (fill) {
      return (
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          priority={priority}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={alt}
        width={width!}
        height={height!}
        className={className}
        priority={priority}
      />
    );
  }

  // For non-Cloudinary URLs, use regular img tag
  if (fill) {
    // For fill mode with img tag, use absolute positioning
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full ${className}`}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }
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
