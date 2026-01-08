"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Star, Upload, X } from "lucide-react"
import { toast } from "@/lib/toast"
import { CloudinaryImage } from "@/components/Cloudinary"
import { API_KEY, API_URL } from "@/lib/config/api"
import type { ExtendedSession } from "@/lib/auth"

interface ReviewFormProps {
  productId: string
  onSuccess?: () => void
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const { data: session } = useSession() as { data: ExtendedSession | null }
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error("Үнэлгээ оруулна уу")
      return
    }

    if (!comment.trim()) {
      toast.error("Сэтгэгдэл оруулна уу")
      return
    }

    setIsSubmitting(true)

    try {
      const backendUrl = API_URL

      if (!backendUrl || !API_KEY) {
        toast.error("Серверийн тохиргоо алга байна. NEXT_PUBLIC_MEDUSA_BACKEND_URL болон NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY-г шалгана уу.")
        return
      }

      if (!session?.accessToken) {
        toast.error("Үнэлгээ үлдээхийн тулд нэвтэрнэ үү")
        return
      }

      const response = await fetch(
        `${backendUrl}/store/product-analytics/reviews/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": API_KEY,
            Authorization: `Bearer ${session.accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            rating,
            title: title.trim() || undefined,
            comment: comment.trim(),
            photos: photos.length > 0 ? photos : undefined,
          }),
        }
      )

      if (response.status === 401) {
        toast.error("Үнэлгээ үлдээхийн тулд нэвтэрнэ үү")
        return
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const message = errorBody?.message || "Үнэлгээ илгээхэд алдаа гарлаа. Дахин оролдоно уу."
        throw new Error(message)
      }

      const data = await response.json()
      toast.success(data.message || "Үнэлгээ амжилттай илгээгдлээ!")

      // Reset form
      setRating(0)
      setTitle("")
      setComment("")
      setPhotos([])

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Failed to submit review:", error)
      const message = error instanceof Error ? error.message : "Үнэлгээ илгээхэд алдаа гарлаа. Дахин оролдоно уу."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoRemove = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-6 rounded-xl">
      <h3 className="text-lg font-semibold text-gray-900">Үнэлгээ үлдээх</h3>

      {/* Rating Stars */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Үнэлгээ <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Гарчиг (сонголттой)
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          placeholder="Товч гарчиг оруулна уу"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Сэтгэгдэл <span className="text-red-500">*</span>
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={4}
          maxLength={1000}
          placeholder="Бүтээгдэхүүний талаар өөрийн сэтгэгдэл бичнэ үү..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/1000 тэмдэгт
        </p>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Зураг нэмэх (сонголттой)
        </label>
        <div className="space-y-3">
          {photos.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                >
                  <CloudinaryImage
                    src={photo}
                    alt={`Photo ${idx + 1}`}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handlePhotoRemove(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {photos.length < 5 && (
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600 hover:text-gray-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">
                Зураг нэмэх ({photos.length}/5)
              </span>
            </button>
          )}
          <p className="text-xs text-gray-500">
            Таны зургууд админ баталсны дараа харагдах болно
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || rating === 0 || !comment.trim()}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isSubmitting ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          "Үнэлгээ илгээх"
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Таны үнэлгээ админ баталсны дараа нийтлэгдэх болно
      </p>
    </form>
  )
}
