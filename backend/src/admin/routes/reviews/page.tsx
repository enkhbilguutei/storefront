import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Badge,
  Button,
  Container,
  Heading,
  Table,
  toast,
  Select,
  Text,
} from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"
import { CheckCircleSolid, ClockSolid, ShieldCheck, ArrowPath } from "@medusajs/icons"

interface Review {
  id: string
  product_id: string
  customer_name: string
  rating: number
  title?: string | null
  comment: string
  photos?: Record<string, string> | null
  verified_purchase: boolean
  is_approved: boolean
  helpful_count: number
  created_at: string
}

const statusOptions = [
  { label: "Хүлээгдэж", value: "pending" },
  { label: "Баталгаажсан", value: "approved" },
  { label: "Бүгд", value: "all" },
]

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string>("pending")

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status })
      const res = await fetch(`/admin/product-analytics/reviews?${params.toString()}`, {
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to fetch reviews")
      }
      const data = await res.json()
      setReviews(data.reviews || [])
    } catch (error) {
      console.error(error)
      toast.error("Үнэлгээ татахад алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const pendingCount = useMemo(() => reviews.filter((r) => !r.is_approved).length, [reviews])

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/admin/product-analytics/reviews/${id}/approve`, {
        method: "POST",
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to approve")
      }
      toast.success("Баталгаажууллаа")
      fetchReviews()
    } catch (error) {
      console.error(error)
      toast.error("Баталгаажуулахад алдаа гарлаа")
    }
  }

  return (
    <Container className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Үнэлгээний баталгаажуулалт</Heading>
          <Text className="text-ui-fg-subtle">Шинэ ирсэн үнэлгээг батлах эсвэл бүх үнэлгээг хянах.</Text>
        </div>
        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={setStatus}>
            <Select.Trigger className="w-44" />
            <Select.Content>
              {statusOptions.map((opt) => (
                <Select.Item key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Button variant="secondary" onClick={fetchReviews} disabled={loading}>
            <ArrowPath className="h-4 w-4" />
            <span>Дахин ачаалах</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-ui-fg-subtle">
        <ShieldCheck className="h-4 w-4" />
        <span>Хүлээгдэж буй: </span>
        <Badge color="orange" size="small">{pendingCount}</Badge>
      </div>

      <div className="border border-ui-border-base rounded-lg overflow-hidden">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Бүтээгдэхүүн</Table.HeaderCell>
              <Table.HeaderCell>Хэрэглэгч</Table.HeaderCell>
              <Table.HeaderCell>Огноо</Table.HeaderCell>
              <Table.HeaderCell>Үнэлгээ</Table.HeaderCell>
              <Table.HeaderCell>Сэтгэгдэл</Table.HeaderCell>
              <Table.HeaderCell>Төлөв</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Үйлдэл</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {reviews.map((review) => (
              <Table.Row key={review.id}>
                <Table.Cell>
                  <div className="flex flex-col">
                    <Text className="font-semibold">{review.product_id}</Text>
                    <Text size="small" className="text-ui-fg-subtle">ID: {review.id}</Text>
                  </div>
                </Table.Cell>
                <Table.Cell>{review.customer_name}</Table.Cell>
                <Table.Cell>
                  <Text size="small" className="text-ui-fg-subtle">
                    {new Date(review.created_at).toLocaleString("mn-MN")}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Badge color="orange" size="small">{review.rating} / 5</Badge>
                </Table.Cell>
                <Table.Cell className="max-w-xs">
                  <Text className="font-semibold">{review.title || "(гарчиггүй)"}</Text>
                  <Text size="small" className="text-ui-fg-subtle line-clamp-3">{review.comment}</Text>
                </Table.Cell>
                <Table.Cell>
                  {review.is_approved ? (
                    <Badge color="green" size="small" className="inline-flex items-center gap-1">
                      <CheckCircleSolid className="h-3 w-3" />
                      Баталгаажсан
                    </Badge>
                  ) : (
                    <Badge color="orange" size="small" className="inline-flex items-center gap-1">
                      <ClockSolid className="h-3 w-3" />
                      Хүлээгдэж
                    </Badge>
                  )}
                </Table.Cell>
                <Table.Cell className="text-right">
                  {!review.is_approved && (
                    <Button variant="primary" size="small" onClick={() => handleApprove(review.id)} disabled={loading}>
                      Батлах
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        {reviews.length === 0 && (
          <div className="p-6 text-center text-ui-fg-subtle">Үнэлгээ олдсонгүй.</div>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Үнэлгээнүүд",
  icon: ShieldCheck,
})

export default ReviewsPage
