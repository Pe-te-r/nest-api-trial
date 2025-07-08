import { UserRole } from 'src/utils/enums'

type ResponseStatus = 'success' | 'error'

export interface ApiResponse<T = any> {
  status: ResponseStatus
  message: string
  data: T | null
}

export interface LoginDataT {
  tokens: {
    accessToken: string
    refreshToken: string
  }
  user: {
    email: string
    id: string
    role: UserRole
  }
}

export function formatResponse<T>(
  status: ResponseStatus,
  message: string,
  data: T | null,
): ApiResponse<T> {
  return {
    status,
    message,
    data,
  }
}

export interface payload {
  sub: string
  email: string
  role: UserRole
}

export interface userIdQueryType {
  account_modal?: string
}

export interface allUserQuery {
  customers?: string
  admin?: string
  vendor?: string
  superadmin?: string
  driver?: string
}

export interface CloudinaryResponse {
  asset_id: string
  public_id: string
  version: number
  version_id: string
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  tags: string[]
  bytes: number
  type: string
  etag: string
  placeholder: boolean
  url: string
  secure_url: string
  folder: string
  original_filename: string
  api_key: string
}
