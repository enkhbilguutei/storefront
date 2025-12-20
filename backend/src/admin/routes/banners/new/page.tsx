// @ts-nocheck
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Label, Button, Select, Switch, toast, clx, Text, Badge } from "@medusajs/ui"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUpTray, XMark, InformationCircleSolid, PhotoSolid } from "@medusajs/icons"

interface BannerConfigItem {
  label: string
  aspectRatio: string
  recommended: { width: number; height: number }
  mobileRecommended: { width: number; height: number }
  description: string
}

type BannerConfigMap = Record<string, BannerConfigItem>

const sectionOptions = [
  { value: "apple", label: "Best of Apple" },
  { value: "gaming", label: "Gaming & Entertainment" },
  { value: "ipad", label: "iPad Collection" },
  { value: "airpods", label: "AirPods & Apple Watch" },
  { value: "accessories", label: "Accessories" },
  { value: "dji", label: "DJI Collection" },
  { value: "gopro", label: "GoPro & Action Cameras" },
]

const NewBannerPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [bannerConfig, setBannerConfig] = useState<BannerConfigMap | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mobileFileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image_url: "",
    mobile_image_url: "",
    link: "",
    alt_text: "",
    placement: "hero",
    grid_size: "3x3",
    section: "apple",
    sort_order: 0,
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

  const handleFileUpload = async (file: File, fieldName: "image_url" | "mobile_image_url" = "image_url") => {
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
        handleChange(fieldName, uploadedUrl)
        toast.success("Зураг амжилттай хуулагдлаа")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Зураг хуулахад алдаа гарлаа")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent, fieldName: "image_url" | "mobile_image_url" = "image_url") => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file, fieldName)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "image_url" | "mobile_image_url" = "image_url") => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, fieldName)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (formData.placement === "product_grid" && !formData.section) {
        throw new Error("Хэсэг сонгоно уу")
      }

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
          grid_size: formData.grid_size,
          section: formData.placement === "product_grid" ? formData.section : null,
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
                <Select.Item value="hero">Үндсэн слайд (16:6)</Select.Item>
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
            onDrop={(e) => handleDrop(e, "image_url")}
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
              onChange={(e) => handleFileSelect(e, "image_url")}
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

        {/* Mobile Image Upload */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Гар утасны зураг</Label>
            <Badge color="purple">Заавал биш</Badge>
          </div>
          <Text className="text-ui-fg-subtle text-xs">
            Гар утсанд тусгайлан зориулсан зураг оруулах (1:1 дөрвөлжин). Хоосон үлдвэл desktop зураг ашиглана.
          </Text>
          {currentConfig && (
            <Text className="text-ui-fg-muted text-xs">
              Санал болгох: <Badge color="green">{currentConfig.mobileRecommended.width}×{currentConfig.mobileRecommended.height}px</Badge>
            </Text>
          )}
          <div
            onDrop={(e) => handleDrop(e, "mobile_image_url")}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => mobileFileInputRef.current?.click()}
            className={clx(
              "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
              "hover:border-ui-border-interactive hover:bg-ui-bg-field-hover",
              formData.mobile_image_url ? "border-ui-border-base" : "border-ui-border-strong"
            )}
          >
            <input
              ref={mobileFileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, "mobile_image_url")}
              className="hidden"
            />
            
            {formData.mobile_image_url ? (
              <div className="relative">
                <div 
                  className="w-full max-w-xs mx-auto bg-[#1d1d1f] rounded-lg overflow-hidden"
                  style={{ aspectRatio: "1/1" }}
                >
                  <img
                    src={formData.mobile_image_url}
                    alt="Mobile Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleChange("mobile_image_url", "")
                  }}
                  className="absolute top-2 right-2 p-1 bg-ui-bg-base rounded-full shadow-md hover:bg-ui-bg-base-hover"
                >
                  <XMark className="w-4 h-4" />
                </button>
                <Text className="text-center text-ui-fg-subtle text-xs mt-2">
                  Гар утасны урьдчилан харах: 1:1 дөрвөлжин харьцаа
                </Text>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                {uploading ? (
                  <div className="text-ui-fg-muted">Хуулж байна...</div>
                ) : (
                  <>
                    <ArrowUpTray className="w-6 h-6 text-ui-fg-muted mb-2" />
                    <p className="text-ui-fg-base text-sm font-medium">Зураг чирж оруулах</p>
                    <p className="text-ui-fg-subtle text-xs">эсвэл дарж сонгох</p>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-ui-fg-subtle text-sm">эсвэл URL оруулах:</span>
            <Input
              value={formData.mobile_image_url}
              onChange={(e) => handleChange("mobile_image_url", e.target.value)}
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

        <div className="grid grid-cols-3 gap-6">
          {/* Grid Size Selector - Only for bento_grid placement */}
          {formData.placement === "bento_grid" && (
            <div className="space-y-2">
              <Label htmlFor="grid_size">Байрлал (5 баннер) *</Label>
              <Select value={formData.grid_size} onValueChange={(v) => handleChange("grid_size", v)}>
                <Select.Trigger>
                  <Select.Value placeholder="Байрлал сонгох" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="3x3">
                    <div className="flex items-center justify-between gap-4">
                      <span>1️⃣ Том зүүн (3×3)</span>
                      <Badge color="green">900×900px</Badge>
                    </div>
                  </Select.Item>
                  <Select.Item value="1x1">
                    <div className="flex items-center justify-between gap-4">
                      <span>2️⃣-4️⃣ Жижиг дунд (1×1)</span>
                      <Badge color="blue">300×300px</Badge>
                    </div>
                  </Select.Item>
                  <Select.Item value="2x3">
                    <div className="flex items-center justify-between gap-4">
                      <span>5️⃣ Өндөр баруун (2×3)</span>
                      <Badge color="purple">600×900px</Badge>
                    </div>
                  </Select.Item>
                </Select.Content>
              </Select>
              <Text className="text-ui-fg-muted text-xs">
                5 баннер: 1 том зүүн + 3 жижиг дунд + 1 өндөр баруун талд
              </Text>
            </div>
          )}

          {formData.placement === "product_grid" && (
            <div className="space-y-2">
              <Label htmlFor="section">Хэсэг *</Label>
              <Select value={formData.section} onValueChange={(v) => handleChange("section", v)}>
                <Select.Trigger>
                  <Select.Value placeholder="Хэсэг сонгох" />
                </Select.Trigger>
                <Select.Content>
                  {sectionOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Text className="text-ui-fg-subtle text-xs">Баннер аль бүтээгдэхүүний хэсэгт харагдах вэ?</Text>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sort_order">Дараалал</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => {
                const value = Number(e.target.value)
                handleChange("sort_order", Number.isNaN(value) ? 0 : Math.max(0, value))
              }}
              min={0}
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
  icon: PhotoSolid,
})

export default NewBannerPage
