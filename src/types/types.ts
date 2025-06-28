type ResponseStatus = 'success' | 'error'

export interface ApiResponse<T = any> {
  status: ResponseStatus
  message: string
  data: T | null
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
