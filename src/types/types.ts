import { UserRole } from 'src/user/entities/user.entity'

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
