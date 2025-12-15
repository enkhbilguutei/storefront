import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Label, Button, Select, Switch, toast, clx, Text, Badge } from "@medusajs/ui"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUpTray, XMark, InformationCircleSolid } from "@medusajs/icons"

const sectionOptions = [
  { value: "apple", label: "Best of Apple" },
  { value: "gaming", label: "Gaming & Entertainment" },
  { value: "ipad", label: "iPad Collection" },
  { value: "airpods", label: "AirPods & Apple Watch" },
  { value: "accessories", label: "Accessories" },
  { value: "dji", label: "DJI Collection" },
  { value: "gopro", label: "GoPro & Action Cameras" },
]

const NewProductGridBannerPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
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
    placement: "product_grid",
    section: "apple",
    sort_order: 1,
    is_active: true,
    dark_text: false,
  })

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
    
    if (!formData.image_url || !formData.link || !formData.section) {
      toast.error("Зураг, холбоос болон хэсэг заавал бөглөнө үү")
      return
    }

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
      navigate("/product-grid-banners")
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

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Шинэ Grid Баннер</Heading>
          <p className="text-ui-fg-subtle text-sm mt-1">
            Бүтээгдэхүүний хэсэгт харагдах босоо баннер үүсгэх
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
        {/* Info Alert */}
        <div className="flex items-start gap-2 p-3 bg-ui-bg-subtle rounded-lg">
          <InformationCircleSolid className="w-4 h-4 text-ui-fg-interactive mt-0.5 shrink-0" />
          <div className="text-sm">
            <Text className="text-ui-fg-base font-medium">Зургийн хэмжээ</Text>
            <Text className="text-ui-fg-subtle">
              Desktop: <Badge color="blue">800×1000px</Badge> (4:5 харьцаа) • 
              Mobile: <Badge color="blue">800×1067px</Badge> (3:4 харьцаа)
            </Text>
            <Text className="text-ui-fg-muted text-xs mt-1">
              Ямар ч хэмжээтэй зураг оруулж болно - автоматаар таслагдаж харагдана.
            </Text>
          </div>
        </div>

        {/* Section Selection */}
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
          <p className="text-ui-fg-subtle text-xs">
            Энэ баннер аль бүтээгдэхүүний хэсэгт харагдах вэ?
          </p>
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
              placeholder="Гайхалтай хүч"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="link">Холбоос *</Label>
          <Input
            id="link"
            value={formData.link}
            onChange={(e) => handleChange("link", e.target.value)}
            placeholder="/products/macbook-pro"
            required
          />
        </div>

        {/* Desktop Image Upload */}
        <div className="space-y-2">
          <Label>Desktop Зураг (4:5) *</Label>
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
                <div 
                  className="w-full max-w-xs mx-auto bg-[#1d1d1f] rounded-lg overflow-hidden"
                  style={{ aspectRatio: "4/5" }}
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
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                {uploading ? (
                  <div className="text-ui-fg-muted">Хуулж байна...</div>
                ) : (
                  <>
                    <ArrowUpTray className="w-8 h-8 text-ui-fg-muted mb-2" />
                    <p className="text-ui-fg-base font-medium">Зураг чирж оруулах</p>
                    <p className="text-ui-fg-subtle text-sm">Санал болгох: 800×1000px (4:5)</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Image Upload */}
        <div className="space-y-2">
          <Label>Mobile Зураг (3:4)</Label>
          <p className="text-ui-fg-subtle text-xs mb-2">
            Заавал биш - дээрх зураг ашиглагдана
          </p>
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
                  style={{ aspectRatio: "3/4" }}
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
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <ArrowUpTray className="w-8 h-8 text-ui-fg-muted mb-2" />
                <p className="text-ui-fg-base font-medium">Mobile зураг (заавал биш)</p>
                <p className="text-ui-fg-subtle text-sm">Санал болгох: 800×1067px (3:4)</p>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="sort_order">Дараалал</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => handleChange("sort_order", parseInt(e.target.value))}
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange("is_active", checked)}
            />
            <Label>Идэвхтэй</Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.dark_text}
              onCheckedChange={(checked) => handleChange("dark_text", checked)}
            />
            <Label>Хар текст</Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Хадгалж байна..." : "Үүсгэх"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/product-grid-banners")}>
            Болих
          </Button>
        </div>
      </form>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Шинэ Grid Баннер",
})

export default NewProductGridBannerPage
