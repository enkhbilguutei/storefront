import { AbstractFileProviderService } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { Readable } from "stream"

type Options = {
  cloud_name: string
  api_key: string
  api_secret: string
  upload_preset?: string
}

type InjectedDependencies = {
  logger: Logger
}

class CloudinaryProviderService extends AbstractFileProviderService {
  static identifier = "cloudinary"
  protected options_: Options
  protected logger_: Logger

  constructor({ logger }: InjectedDependencies, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options

    cloudinary.config({
      cloud_name: options.cloud_name,
      api_key: options.api_key,
      api_secret: options.api_secret,
    })
  }

  async upload(file: {
    filename: string
    mimeType: string
    content: string
  }): Promise<{ url: string; key: string }> {
    return new Promise((resolve, reject) => {
      // Clean filename - remove extension for public_id
      const publicId = `medusa-uploads/${file.filename.replace(/\.[^/.]+$/, "")}_${Date.now()}`
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: "auto",
        },
        (error: any, result: UploadApiResponse | undefined) => {
          if (error) return reject(error)
          if (!result) return reject(new Error("No result from Cloudinary"))
          
          resolve({
            url: result.secure_url,
            key: result.public_id,
          })
        }
      )

      uploadStream.write(Buffer.from(file.content, "base64"))
      uploadStream.end()
    })
  }

  async delete(files: any): Promise<void> {
    const fileList = Array.isArray(files) ? files : [files]
    for (const file of fileList) {
      await cloudinary.uploader.destroy(file.fileKey || file.key)
    }
  }

  async getPresignedDownloadUrl(fileData: any): Promise<string> {
    return cloudinary.url(fileData.fileKey || fileData.key, {
      secure: true,
    })
  }

  async getPresignedUploadUrl(fileData: {
    filename: string
    mimeType?: string
    access?: string
  }): Promise<{ url: string; key: string }> {
    const timestamp = Math.round(Date.now() / 1000)
    const publicId = `medusa-uploads/${fileData.filename.replace(/\.[^/.]+$/, "")}_${timestamp}`
    
    // Generate signature for authenticated upload
    const paramsToSign = {
      timestamp,
      public_id: publicId,
    }
    
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      this.options_.api_secret
    )

    // Build the presigned URL with all required parameters
    const params = new URLSearchParams({
      api_key: this.options_.api_key,
      timestamp: timestamp.toString(),
      signature,
      public_id: publicId,
    })

    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.options_.cloud_name}/auto/upload?${params.toString()}`

    return {
      url: uploadUrl,
      key: publicId,
    }
  }

  async getDownloadStream(fileData: any): Promise<Readable> {
    const url = cloudinary.url(fileData.fileKey || fileData.key, {
      secure: true,
    })
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }
    
    // Convert web ReadableStream to Node.js Readable
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("No response body")
    }

    return new Readable({
      async read() {
        const { done, value } = await reader.read()
        if (done) {
          this.push(null)
        } else {
          this.push(Buffer.from(value))
        }
      }
    })
  }

  async getAsBuffer(fileData: any): Promise<Buffer> {
    const url = cloudinary.url(fileData.fileKey || fileData.key, {
      secure: true,
    })
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }
    
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }
}

export default CloudinaryProviderService
