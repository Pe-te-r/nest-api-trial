/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-base-to-string */

import { Injectable, Inject } from '@nestjs/common'
import { v2 as cloudinaryLib } from 'cloudinary'
import { CloudinaryResponse } from '../types/types'
import * as streamifier from 'streamifier'

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private cloudinary: typeof cloudinaryLib) {}

  private isCloudinaryResponse(obj: any): obj is CloudinaryResponse {
    return obj && typeof obj.secure_url === 'string' && typeof obj.public_id === 'string'
  }

  async uploadImage(file: Express.Multer.File): Promise<CloudinaryResponse> {
    if (!file?.buffer) {
      throw new Error('Invalid file data')
    }
    console.log('upload')
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: 'your-folder-name',
          resource_type: 'auto', // Automatically detect image/video/raw
        },
        (error: unknown, result: unknown) => {
          if (error) {
            return reject(
              error instanceof Error
                ? error
                : new Error(`Cloudinary upload failed: ${String(error)}`),
            )
          }

          if (!this.isCloudinaryResponse(result)) {
            return reject(new Error('Invalid response from Cloudinary'))
          }

          resolve(result)
        },
      )

      streamifier
        .createReadStream(file.buffer)
        .on('error', (err) => reject(new Error(`Stream error: ${err.message}`)))
        .pipe(uploadStream)
    })
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      const result = await this.cloudinary.uploader.destroy(publicId)

      if (result.result !== 'ok') {
        throw new Error(`Failed to delete image: ${result.result}`)
      }
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error(`Cloudinary deletion failed: ${String(error)}`)
    }
  }
}
