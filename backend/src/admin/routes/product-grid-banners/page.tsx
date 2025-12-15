import { defineRouteConfig } from "@medusajs/admin-sdk"
import { PhotoSolid, PlusMini, PencilSquare, Trash } from "@medusajs/icons"
import { Container, Heading, Table, Badge, Button, usePrompt, toast } from "@medusajs/ui"
import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"

interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string
  mobile_image_url: string | null
  link: string
  placement: string
  section: string | null
  sort_order: number
  is_active: boolean
  dark_text: boolean
}

const sectionLabels: Record<string, string> = {
  apple: "Best of Apple",
  gaming: "Gaming & Entertainment",
  ipad: "iPad Collection",
  airpods: "AirPods & Apple Watch",
  accessories: "Accessories",
  dji: "DJI Collection",
  gopro: "GoPro & Action Cameras",
}

const ProductGridBannersPage = () => {
  const navigate = useNavigate()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const dialog = usePrompt()

  const fetchBanners = useCallback(async () => {
    try {
      const url = filter === "all" 
        ? "/admin/banners?placement=product_grid" 
        : `/admin/banners?placement=product_grid&section=${filter}`
      const response = await fetch(url, {
        credentials: "include",
      })
      const data = await response.json()
      setBanners(data.banners || [])
    } catch (error) {
      console.error("Failed to fetch banners:", error)
      toast.error("Баннер татахад алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await dialog({
      title: "Баннер устгах",
      description: `"${title || 'Нэргүй баннер'}" баннерыг устгахдаа итгэлтэй байна уу?`,
    })

    if (!confirmed) return

    try {
      await fetch(`/admin/banners/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      toast.success("Баннер амжилттай устгагдлаа")
      fetchBanners()
    } catch (error) {
      console.error("Failed to delete banner:", error)
      toast.error("Баннер устгахад алдаа гарлаа")
    }
  }

  const toggleActive = async (banner: Banner) => {
    try {
      await fetch(`/admin/banners/${banner.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_active: !banner.is_active }),
      })
      toast.success(banner.is_active ? "Баннер идэвхгүй болгов" : "Баннер идэвхжүүлэв")
      fetchBanners()
    } catch (error) {
      console.error("Failed to toggle banner:", error)
      toast.error("Алдаа гарлаа")
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Бүтээгдэхүүний Grid Баннерууд</Heading>
          <p className="text-ui-fg-subtle text-sm mt-1">
            Нүүр хуудасны бүтээгдэхүүний хэсэгт харагдах баннерууд (4:5 босоо харьцаа)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-1.5 text-sm"
          >
            <option value="all">Бүгд</option>
            {Object.entries(sectionLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <Button size="small" variant="secondary" onClick={() => navigate("/product-grid-banners/new")}>
            <PlusMini />
            Нэмэх
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="text-ui-fg-muted">Уншиж байна...</div>
          </div>
        ) : banners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <PhotoSolid className="text-ui-fg-muted mb-2 h-8 w-8" />
            <p className="text-ui-fg-muted">Баннер олдсонгүй</p>
            <p className="text-ui-fg-subtle text-sm">
              Бүтээгдэхүүний grid баннер нэмэхийн тулд "Нэмэх" товчийг дарна уу.
            </p>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Зураг</Table.HeaderCell>
                <Table.HeaderCell>Гарчиг</Table.HeaderCell>
                <Table.HeaderCell>Хэсэг</Table.HeaderCell>
                <Table.HeaderCell>Дараалал</Table.HeaderCell>
                <Table.HeaderCell>Төлөв</Table.HeaderCell>
                <Table.HeaderCell className="text-right">Үйлдэл</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {banners.map((banner) => (
                <Table.Row key={banner.id}>
                  <Table.Cell>
                    <img 
                      src={banner.image_url} 
                      alt={banner.title || "Product Grid Banner"}
                      className="h-16 w-12 rounded object-cover"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <div className="font-medium">{banner.title || "Нэргүй"}</div>
                      {banner.subtitle && (
                        <div className="text-ui-fg-subtle text-sm">{banner.subtitle}</div>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="blue">
                      {sectionLabels[banner.section || ""] || banner.section || "Тодорхойгүй"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{banner.sort_order}</Table.Cell>
                  <Table.Cell>
                    <button
                      onClick={() => toggleActive(banner)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        banner.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {banner.is_active ? 'Идэвхтэй' : 'Идэвхгүй'}
                    </button>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/product-grid-banners/${banner.id}`)}
                        className="text-ui-fg-subtle hover:text-ui-fg-base"
                      >
                        <PencilSquare className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id, banner.title)}
                        className="text-ui-fg-subtle hover:text-ui-fg-error"
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Grid Баннерууд",
  icon: PhotoSolid,
})

export default ProductGridBannersPage
