import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Label, Button, Select, Switch, toast, clx, Text, Badge } from "@medusajs/ui"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUpTray, XMark, InformationCircleSolid } from "@medusajs/icons"

interface BannerConfigItem {
  label: string
  aspectRatio: string
  recommended: { width: number; height: number }
  description: string
}

type BannerConfigMap = Record<string, BannerConfigItem>

const NewBannerPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [bannerConfig, setBannerConfig] = useState<BannerConfigMap | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image_url: "",
    link: "",
    alt_text: "",
    placement: "hero",
    sort_order: 1,
    is_active: true,
    dark_text: false,
  })

  // Fetch banner config on mount
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

  const currentConfig = bannerConfig?.[formData.placement]

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
    setLoading(true)

    try {
      const response = await fetch("/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          title: formData.title || null,
          subtitle: formData.subtitle || null,
          description: formData.description || null,
          alt_text: formData.alt_text || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create banner")
      }

      toast.success("Баннер амжилттай үүсгэгдлээ")
      navigate("/banners")
    } catch (error) {
      console.error("Failed to create banner:", error)
      toast.error(error instanceof Error ? error.message : "Алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Get aspect ratio style for preview
  const getAspectRatioStyle = () => {
    if (!currentConfig) return { aspectRatio: "16/9" }
    return { aspectRatio: currentConfig.aspectRatio }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Шинэ баннер</Heading>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
        {/* Placement Selection - Move to top for better UX */}
        <div className="space-y-2">
          <Label htmlFor="placement">Баннерийн төрөл *</Label>
          <Select value={formData.placement} onValueChange={(v) => handleChange("placement", v)}>
            <Select.Trigger>
              <Select.Value placeholder="Төрөл сонгох" />
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
          
          {/* Recommended size info */}
          {currentConfig && (
            <div className="flex items-start gap-2 mt-2 p-3 bg-ui-bg-subtle rounded-lg">
              <InformationCircleSolid className="w-4 h-4 text-ui-fg-interactive mt-0.5 shrink-0" />
              <div className="text-sm">
                <Text className="text-ui-fg-base font-medium">{currentConfig.description}</Text>
                <Text className="text-ui-fg-subtle">
                  Санал болгох хэмжээ: <Badge color="blue">{currentConfig.recommended.width}×{currentConfig.recommended.height}px</Badge>
                  {" "}({currentConfig.aspectRatio.replace("/", ":")} харьцаа)
                </Text>
                <Text className="text-ui-fg-muted text-xs mt-1">
                  Ямар ч хэмжээтэй зураг оруулж болно - автоматаар таслагдаж харагдана.
                </Text>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Гарчиг</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="MacBook Pro M4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Дэд гарчиг</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              placeholder="Гайхалтай хүч. Гайхамшигт загвар."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Тайлбар</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Урт тайлбар текст (заавал биш)"
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
                {/* Preview with actual aspect ratio */}
                <div 
                  className="w-full max-w-2xl mx-auto bg-[#1d1d1f] rounded-lg overflow-hidden"
                  style={getAspectRatioStyle()}
                >
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
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
                <Text className="text-center text-ui-fg-subtle text-xs mt-2">
                  Урьдчилан харах: {currentConfig?.aspectRatio.replace("/", ":")} харьцаатай (object-cover)
                </Text>
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
                    {currentConfig && (
                      <p className="text-ui-fg-muted text-xs mt-2">
                        Санал болгох: {currentConfig.recommended.width}×{currentConfig.recommended.height}px
                      </p>
                    )}
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
            placeholder="/products/macbook-pro-m4"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
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
              value={formData.alt_text}
              onChange={(e) => handleChange("alt_text", e.target.value)}
              placeholder="Зургийн тайлбар"
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
  label: "Шинэ баннер",
})

export default NewBannerPage
