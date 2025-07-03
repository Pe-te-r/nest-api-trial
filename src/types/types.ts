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
