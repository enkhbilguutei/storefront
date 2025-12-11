"use client"

import { useEffect, useState } from "react"
import { Star, ThumbsUp, BadgeCheck } from "lucide-react"
import { CloudinaryImage } from "@/components/Cloudinary"

interface Review {
  id: string
  customer_name: string
  rating: number
  title?: string
  comment: string
  photos?: string[]
  verified_purchase: boolean
  helpful_count: number
  created_at: string
}

interface CustomerReviewsProps {
  productId: string
}

export function CustomerReviews({ productId }: CustomerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
        const response = await fetch(
          `${backendUrl}/store/product-analytics/reviews/${productId}?limit=5`
        )

        if (response.ok) {
          const data = await response.json()
          setReviews(data.reviews)
          setRating(data.rating)
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [productId])

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
      const response = await fetch(
        `${backendUrl}/store/product-analytics/reviews/${reviewId}/helpful`,
        { method: "POST" }
      )

      if (response.ok) {
        // Update local state
        setReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId
              ? { ...review, helpful_count: review.helpful_count + 1 }
              : review
          )
        )
      }
    } catch (error) {
      console.error("Failed to mark review as helpful:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (!rating || rating.count === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{rating.average}</div>
            <div className="flex items-center justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(rating.average)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-gray-600 text-sm">
              <span className="font-semibold text-gray-900">{rating.count}</span> үнэлгээ
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Бодит худалдан авалт хийсэн хэрэглэгчдийн үнэлгээ
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Хэрэглэгчдийн үнэлгээ</h3>
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border border-gray-200 rounded-lg p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{review.customer_name}</span>
                  {review.verified_purchase && (
                    <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <BadgeCheck className="w-3 h-3" />
                      <span>Баталгаажсан</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString("mn-MN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Title */}
            {review.title && (
              <h4 className="font-medium text-gray-900">{review.title}</h4>
            )}

            {/* Comment */}
            <p className="text-gray-700 text-sm">{review.comment}</p>

            {/* Photos */}
            {review.photos && review.photos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {review.photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                  >
                    <CloudinaryImage
                      src={photo}
                      alt={`Review photo ${idx + 1}`}
                      width={80}
                      height={80}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Helpful Button */}
            <button
              onClick={() => handleMarkHelpful(review.id)}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Тустай ({review.helpful_count})</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
