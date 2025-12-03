import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Label, Button, Select, Switch, toast, clx, Text, Badge } from "@medusajs/ui"
import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowUpTray, XMark, InformationCircleSolid } from "@medusajs/icons"

interface Banner {
  id: string
  title: string | null
  subtitle: string | null
  description: string | null
  image_url: string
  link: string
  alt_text: string | null
  placement: string
  sort_order: number
  is_active: boolean
  dark_text: boolean
}

interface BannerConfigItem {
  label: string
  aspectRatio: string
  recommended: { width: number; height: number }
  description: string
}

type BannerConfigMap = Record<string, BannerConfigItem>

const EditBannerPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [bannerConfig, setBannerConfig] = useState<BannerConfigMap | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<Banner | null>(null)

  // Fetch banner config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/admin/banners/config", {
          credentials: "include",
        })
        const data = await response.json()
        setBannerConfig(data.config)
      } catch (error) {
        console.error("Failed to fetch banner config:", error)
      }
    }
    fetchConfig()
  }, [])

  const currentConfig = formData?.placement ? bannerConfig?.[formData.placement] : null

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`/admin/banners/${id}`, {
          credentials: "include",
        })
        const data = await response.json()
        setFormData(data.banner)
      } catch (error) {
        console.error("Failed to fetch banner:", error)
        toast.error("Баннер татахад алдаа гарлаа")
        navigate("/banners")
      } finally {
        setFetching(false)
      }
    }
    fetchBanner()
  }, [id, navigate])

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("files", file)

      const response = await fetch("/admin/uploads", {
        method: "POST",
        credentials: "include",
        body: uploadFormData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      const uploadedUrl = data.files?.[0]?.url
      
      if (uploadedUrl) {
        handleChange("image_url", uploadedUrl)
        toast.success("Зураг амжилттай хуулагдлаа")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Зураг хуулахад алдаа гарлаа")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return
    
    setLoading(true)

    try {
      const response = await fetch(`/admin/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title || null,
          subtitle: formData.subtitle || null,
          description: formData.description || null,
          image_url: formData.image_url,
          link: formData.link,
          alt_text: formData.alt_text || null,
          placement: formData.placement,
          sort_order: formData.sort_order,
          is_active: formData.is_active,
          dark_text: formData.dark_text,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update banner")
      }

      toast.success("Баннер амжилттай шинэчлэгдлээ")
      navigate("/banners")
    } catch (error) {
      console.error("Failed to update banner:", error)
      toast.error(error instanceof Error ? error.message : "Алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof Banner, value: string | number | boolean) => {
    if (!formData) return
    setFormData({ ...formData, [field]: value })
  }

  if (fetching) {
    return (
      <Container className="p-6">
        <div className="text-ui-fg-muted">Уншиж байна...</div>
      </Container>
    )
  }

  if (!formData) {
    return (
      <Container className="p-6">
        <div className="text-ui-fg-error">Баннер олдсонгүй</div>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Баннер засах</Heading>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Гарчиг</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Дэд гарчиг</Label>
            <Input
              id="subtitle"
              value={formData.subtitle || ""}
              onChange={(e) => handleChange("subtitle", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Тайлбар</Label>
          <Input
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Зураг *</Label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className={clx(
              "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
              "hover:border-ui-border-interactive hover:bg-ui-bg-field-hover",
              formData.image_url ? "border-ui-border-base" : "border-ui-border-strong"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {formData.image_url ? (
              <div className="relative">
                <img
                  src={formData.image_url}
                  alt="Preview"
                  className="w-full h-48 object-contain rounded-lg bg-ui-bg-subtle"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleChange("image_url", "")
                  }}
                  className="absolute top-2 right-2 p-1 bg-ui-bg-base rounded-full shadow-md hover:bg-ui-bg-base-hover"
                >
                  <XMark className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                {uploading ? (
                  <div className="text-ui-fg-muted">Хуулж байна...</div>
                ) : (
                  <>
                    <ArrowUpTray className="w-8 h-8 text-ui-fg-muted mb-2" />
                    <p className="text-ui-fg-base font-medium">Зураг чирж оруулах</p>
                    <p className="text-ui-fg-subtle text-sm">эсвэл дарж сонгох</p>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-ui-fg-subtle text-sm">эсвэл URL оруулах:</span>
            <Input
              value={formData.image_url}
              onChange={(e) => handleChange("image_url", e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="link">Холбоос *</Label>
          <Input
            id="link"
            value={formData.link}
            onChange={(e) => handleChange("link", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="placement">Байршил *</Label>
            <Select value={formData.placement} onValueChange={(v) => handleChange("placement", v)}>
              <Select.Trigger>
                <Select.Value placeholder="Байршил сонгох" />
              </Select.Trigger>
              <Select.Content>
                {bannerConfig ? (
                  Object.entries(bannerConfig).map(([key, config]) => (
                    <Select.Item key={key} value={key}>
                      {config.label} ({config.aspectRatio.replace("/", ":")})
                    </Select.Item>
                  ))
                ) : (
                  <>
                    <Select.Item value="hero">Үндсэн слайд (16:6)</Select.Item>
                    <Select.Item value="iphone">iPhone баннер (16:10)</Select.Item>
                    <Select.Item value="dji_large">DJI том карт (4:3)</Select.Item>
                    <Select.Item value="dji_small">DJI жижиг карт (4:3)</Select.Item>
                    <Select.Item value="promo">Промо баннер (3:1)</Select.Item>
                    <Select.Item value="square">Дөрвөлжин (1:1)</Select.Item>
                  </>
                )}
              </Select.Content>
            </Select>
            {currentConfig && (
              <div className="flex items-start gap-2 mt-2 p-2 bg-ui-bg-subtle rounded text-xs">
                <InformationCircleSolid className="w-3 h-3 text-ui-fg-interactive mt-0.5 shrink-0" />
                <Text className="text-ui-fg-subtle">
                  Санал болгох: <Badge color="blue" size="xsmall">{currentConfig.recommended.width}×{currentConfig.recommended.height}px</Badge>
                </Text>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Дараалал</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => handleChange("sort_order", parseInt(e.target.value) || 1)}
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alt_text">Alt текст</Label>
            <Input
              id="alt_text"
              value={formData.alt_text || ""}
              onChange={(e) => handleChange("alt_text", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange("is_active", checked)}
            />
            <Label htmlFor="is_active">Идэвхтэй</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="dark_text"
              checked={formData.dark_text}
              onCheckedChange={(checked) => handleChange("dark_text", checked)}
            />
            <Label htmlFor="dark_text">Бараан текст (цайвар дэвсгэрт)</Label>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-4">
          <Button type="submit" isLoading={loading}>
            Хадгалах
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/banners")}>
            Цуцлах
          </Button>
        </div>
      </form>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Баннер засах",
})

export default EditBannerPage
