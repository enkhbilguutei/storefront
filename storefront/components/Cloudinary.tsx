"use client";

import { CldImage, CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useState } from "react";

interface CloudinaryImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  showShimmer?: boolean;
}

export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  showShimmer = true,
}: CloudinaryImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Check if the src is a Cloudinary URL or a regular URL
  const isCloudinaryUrl = src?.includes("cloudinary.com") || src?.includes("res.cloudinary.com");
  const isPublicId = !src?.includes("/") && !src?.startsWith("http");
  
  if (!src || hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-gray-400 text-sm">Зураггүй</span>
      </div>
    );
  }
  
  const shimmerClass = showShimmer && isLoading ? "animate-pulse bg-gray-200" : "";
  const imageClass = `${className} ${shimmerClass} transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`;

  if (isPublicId) {
    if (fill) {
      return (
        <div className="relative w-full h-full">
          {isLoading && showShimmer && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <CldImage
            src={src}
            alt={alt}
            fill
            className={imageClass}
            priority={priority}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
          />
        </div>
      );
    }
    return (
      <div className="relative" style={{ width, height }}>
        {isLoading && showShimmer && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
        )}
        <CldImage
          src={src}
          alt={alt}
          width={width!}
          height={height!}
          className={imageClass}
          priority={priority}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      </div>
    );
  }

  if (isCloudinaryUrl) {
    if (fill) {
      return (
        <div className="relative w-full h-full">
          {isLoading && showShimmer && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <Image
            src={src}
            alt={alt}
            fill
            className={imageClass}
            priority={priority}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
          />
        </div>
      );
    }
    return (
      <div className="relative" style={{ width, height }}>
        {isLoading && showShimmer && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
        )}
        <Image
          src={src}
          alt={alt}
          width={width!}
          height={height!}
          className={imageClass}
          priority={priority}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      </div>
    );
  }

  // For non-Cloudinary URLs, use regular img tag
  if (fill) {
    // For fill mode with img tag, use absolute positioning
    return (
      <div className="relative w-full h-full">
        {isLoading && showShimmer && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full ${imageClass}`}
          loading={priority ? "eager" : "lazy"}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      </div>
    );
  }
  return (
    <div className="relative" style={{ width, height }}>
      {isLoading && showShimmer && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={imageClass}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
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
