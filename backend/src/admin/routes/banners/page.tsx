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
  link: string
  placement: string
  sort_order: number
  is_active: boolean
  dark_text: boolean
}

const placementLabels: Record<string, string> = {
  hero: "Үндсэн слайд (16:6)",
  bento: "Бенто баннер (16:5)",
}

const BannersPage = () => {
  const navigate = useNavigate()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const dialog = usePrompt()

  const fetchBanners = useCallback(async () => {
    try {
      const url = filter === "all" 
        ? "/admin/banners" 
        : `/admin/banners?placement=${filter}`
      const response = await fetch(url, {
        credentials: "include",
      })
      const data = await response.json()
      const filteredBanners = (data.banners || []).filter((banner: Banner) => banner.placement !== "bento_grid")
      setBanners(filteredBanners)
    } catch (error) {
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => navigate("/reviews")}>Үнэлгээнүүд</Button>
              <Button variant="primary" onClick={() => navigate("/banners/new")}>Шинэ баннер</Button>
            </div>
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
      description: `"${title}" баннерыг устгахдаа итгэлтэй байна уу?`,
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
        <Heading level="h1">Баннерууд</Heading>
        <div className="flex items-center gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-1.5 text-sm"
          >
            <option value="all">Бүгд</option>
            <option value="hero">Үндсэн слайд (16:6)</option>
          </select>
          <Button size="small" variant="secondary" onClick={() => navigate("/banners/new")}>
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
              Нүүр хуудасны баннер нэмэхийн тулд "Нэмэх" товчийг дарна уу.
            </p>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Зураг</Table.HeaderCell>
                <Table.HeaderCell>Гарчиг</Table.HeaderCell>
                <Table.HeaderCell>Байршил</Table.HeaderCell>
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
                      alt={banner.title}
                      className="h-12 w-20 rounded object-cover"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <div className="font-medium">{banner.title}</div>
                      {banner.subtitle && (
                        <div className="text-ui-fg-subtle text-sm">{banner.subtitle}</div>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="grey">{placementLabels[banner.placement] || banner.placement}</Badge>
                  </Table.Cell>
                  <Table.Cell>{banner.sort_order}</Table.Cell>
                  <Table.Cell>
                    <Badge 
                      color={banner.is_active ? "green" : "grey"}
                      className="cursor-pointer"
                      onClick={() => toggleActive(banner)}
                    >
                      {banner.is_active ? "Идэвхтэй" : "Идэвхгүй"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="small" 
                        variant="transparent"
                        onClick={() => navigate(`/banners/${banner.id}`)}
                      >
                        <PencilSquare className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="small" 
                        variant="transparent"
                        onClick={() => handleDelete(banner.id, banner.title)}
                      >
                        <Trash className="text-ui-fg-error h-4 w-4" />
                      </Button>
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
  label: "Баннерууд",
  icon: PhotoSolid,
})

export default BannersPage
