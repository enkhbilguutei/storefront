import { AbstractFileProviderService, MedusaError } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { v2 as cloudinary, UploadApiResponse } from "cloudinary"

type Options = {
  cloud_name: string
  api_key: string
  api_secret: string
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
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: file.filename,
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

  async getPresignedUploadUrl(fileData: any): Promise<string> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Presigned upload URLs are not supported by the Cloudinary provider"
    )
  }
}

export default CloudinaryProviderService
