import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, toast, Badge, Text } from "@medusajs/ui"
import { useState, useEffect, useRef } from "react"
import { ArrowUpTray, XMark, PencilSquare } from "@medusajs/icons"

const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
)

export const config = defineRouteConfig({
  label: "Bento Grid (5)",
  icon: GridIcon,
})

interface Banner {
  id: string
  image_url: string
  link: string
  grid_size: string
  sort_order: number
  is_active: boolean
}

interface BannerSlot {
  position: number
  gridSize: "3x3" | "1x1" | "2x3"
  label: string
  color: string
  banner: Banner | null
}

interface BannerSlotProps {
  slot: BannerSlot
  className: string
  onDrop: (e: React.DragEvent, slot: BannerSlot) => void
  onFileSelect: (file: File, slot: BannerSlot) => void
  onDelete: (slot: BannerSlot) => void
  uploading: boolean
}

const BentoGridPage = () => {
  const [slots, setSlots] = useState<BannerSlot[]>([
    { position: 1, gridSize: "3x3", label: "Том зүүн", color: "green", banner: null },
    { position: 2, gridSize: "1x1", label: "Жижиг 1", color: "blue", banner: null },
    { position: 3, gridSize: "1x1", label: "Жижиг 2", color: "blue", banner: null },
    { position: 4, gridSize: "1x1", label: "Жижиг 3", color: "blue", banner: null },
    { position: 5, gridSize: "2x3", label: "Өндөр баруун", color: "purple", banner: null },
  ])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<number | null>(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch("/admin/banners?placement=bento_grid", {
        credentials: "include",
      })
      const data = await response.json()
      const banners: Banner[] = data.banners || []

      // Assign banners to slots based on grid_size and sort_order
      const updatedSlots = [...slots]
      
      const large = banners.find(b => b.grid_size === "3x3")
      if (large) updatedSlots[0].banner = large

      const small = banners.filter(b => b.grid_size === "1x1").sort((a, b) => a.sort_order - b.sort_order)
      small.forEach((b, i) => {
        if (updatedSlots[i + 1]) updatedSlots[i + 1].banner = b
      })

      const tall = banners.find(b => b.grid_size === "2x3")
      if (tall) updatedSlots[4].banner = tall

      setSlots(updatedSlots)
    } catch (error) {
      console.error("Failed to fetch banners:", error)
      toast.error("Баннер татахад алдаа гарлаа")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File, slot: BannerSlot) => {
    setUploading(slot.position)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("files", file)

      const uploadResponse = await fetch("/admin/uploads", {
        method: "POST",
        credentials: "include",
        body: uploadFormData,
      })

      if (!uploadResponse.ok) throw new Error("Upload failed")

      const uploadData = await uploadResponse.json()
      const imageUrl = uploadData.files?.[0]?.url

      if (!imageUrl) throw new Error("No image URL")

      // Create or update banner
      const bannerData = {
        image_url: imageUrl,
        link: slot.banner?.link || "/",
        placement: "bento_grid",
        grid_size: slot.gridSize,
        sort_order: slot.position,
        is_active: true,
        title: null,
        subtitle: null,
        description: null,
        alt_text: `Bento banner ${slot.position}`,
      }

      let response
      if (slot.banner?.id) {
        response = await fetch(`/admin/banners/${slot.banner.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(bannerData),
        })
      } else {
        response = await fetch("/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(bannerData),
        })
      }

      if (!response.ok) throw new Error("Failed to save banner")

      toast.success("Амжилттай хадгалагдлаа")
      fetchBanners()
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Алдаа гарлаа")
    } finally {
      setUploading(null)
    }
  }

  const handleDrop = (e: React.DragEvent, slot: BannerSlot) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file, slot)
    }
  }

  const handleDelete = async (slot: BannerSlot) => {
    if (!slot.banner?.id) return
    
    if (!confirm("Устгах уу?")) return

    try {
      const response = await fetch(`/admin/banners/${slot.banner.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) throw new Error("Delete failed")

      toast.success("Устгагдлаа")
      fetchBanners()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Алдаа гарлаа")
    }
  }

  if (loading) {
    return <Container><div className="p-6">Уншиж байна...</div></Container>
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Bento Grid (5 баннер)</Heading>
          <Text className="text-ui-fg-subtle text-sm mt-1">
            5 байрлалд зураг оруулна уу
          </Text>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Visual Grid Layout */}
        <div className="grid grid-cols-6 gap-4" style={{ gridAutoRows: "150px" }}>
          
          {/* Position 1: Large left (3x3) */}
          <BannerSlot
            slot={slots[0]}
            className="col-span-3 row-span-3"
            onDrop={handleDrop}
            onFileSelect={handleFileUpload}
            onDelete={handleDelete}
            uploading={uploading === 1}
          />

          {/* Position 2: Small middle top (1x1) */}
          <BannerSlot
            slot={slots[1]}
            className="col-span-1 row-span-1"
            onDrop={handleDrop}
            onFileSelect={handleFileUpload}
            onDelete={handleDelete}
            uploading={uploading === 2}
          />

          {/* Position 5: Tall right (2x3) */}
          <BannerSlot
            slot={slots[4]}
            className="col-span-2 row-span-3"
            onDrop={handleDrop}
            onFileSelect={handleFileUpload}
            onDelete={handleDelete}
            uploading={uploading === 5}
          />

          {/* Position 3: Small middle center (1x1) */}
          <BannerSlot
            slot={slots[2]}
            className="col-span-1 row-span-1"
            onDrop={handleDrop}
            onFileSelect={handleFileUpload}
            onDelete={handleDelete}
            uploading={uploading === 3}
          />

          {/* Position 4: Small middle bottom (1x1) */}
          <BannerSlot
            slot={slots[3]}
            className="col-span-1 row-span-1"
            onDrop={handleDrop}
            onFileSelect={handleFileUpload}
            onDelete={handleDelete}
            uploading={uploading === 4}
          />

        </div>
      </div>
    </Container>
  )
}

interface BannerSlotComponentProps {
  slot: BannerSlot
  className: string
  onDrop: (e: React.DragEvent, slot: BannerSlot) => void
  onFileSelect: (file: File, slot: BannerSlot) => void
  onDelete: (slot: BannerSlot) => void
  uploading: boolean
}

function BannerSlot({ slot, className, onDrop, onFileSelect, onDelete, uploading }: BannerSlotComponentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg overflow-hidden ${className} ${
        slot.banner ? "border-ui-border-base" : "border-ui-border-strong"
      }`}
      onDrop={(e) => onDrop(e, slot)}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !slot.banner && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            onFileSelect(file, slot)
          }
        }}
      />

      {slot.banner ? (
        <>
          <img
            src={slot.banner.image_url}
            alt={`Banner ${slot.position}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="small"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              <PencilSquare className="w-4 h-4" />
            </Button>
            <Button
              size="small"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(slot)
              }}
            >
              <XMark className="w-4 h-4" />
            </Button>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge color={slot.color as any}>{slot.label}</Badge>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center cursor-pointer hover:bg-ui-bg-subtle transition">
          {uploading ? (
            <div className="text-ui-fg-muted text-sm">Хуулж байна...</div>
          ) : (
            <>
              <ArrowUpTray className="w-8 h-8 text-ui-fg-muted mb-2" />
              <Badge color={slot.color as any} className="mb-2">{slot.label}</Badge>
              <div className="text-ui-fg-muted text-xs">{slot.gridSize}</div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default BentoGridPage
