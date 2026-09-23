import axios from 'axios'
import i18n from '../i18n'

interface FieldError {
  field: string
  code: string
}

interface ApiErrorBody {
  code?: string
  fieldErrors?: FieldError[]
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data
    if (body?.fieldErrors?.length) {
      return body.fieldErrors
        .map((fe) => i18n.t(`errors.${fe.code}`, { defaultValue: fe.code }))
        .join(', ')
    }
    if (body?.code) {
      return i18n.t(`errors.${body.code}`, { defaultValue: i18n.t('errors.GENERIC') })
    }
  }
  return i18n.t('errors.GENERIC')
}
