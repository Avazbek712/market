import axios from 'axios'

interface FieldError {
  field: string
  message: string
}

interface ApiErrorBody {
  message?: string
  fieldErrors?: FieldError[]
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data
    if (body?.fieldErrors?.length) {
      return body.fieldErrors.map((fe) => fe.message).join(', ')
    }
    if (body?.message) {
      return body.message
    }
  }
  return 'Что-то пошло не так, попробуйте ещё раз'
}
