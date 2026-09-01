import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import type { RegisterPayload } from '../api/auth'
import { extractErrorMessage } from '../api/errors'
import { useAuth } from '../auth/AuthContext'
import AuthCard from '../components/AuthCard'
import FormField from '../components/FormField'
import LanguageSwitcher from '../components/LanguageSwitcher'
import SubmitButton from '../components/SubmitButton'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterPayload>({
    email: '',
    password: '',
    fullName: '',
    role: 'BUYER',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof RegisterPayload>(key: K, value: RegisterPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(form)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const roles: { value: RegisterPayload['role']; label: string }[] = [
    { value: 'BUYER', label: t('auth.register.roleBuyer') },
    { value: 'SELLER', label: t('auth.register.roleSeller') },
  ]

  return (
    <div className="relative">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <AuthCard title={t('auth.register.title')}>
        <form onSubmit={handleSubmit}>
          <FormField
            id="fullName"
            label={t('auth.register.fullNameLabel')}
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            required
          />
          <FormField
            id="email"
            label={t('auth.register.emailLabel')}
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
          />
          <FormField
            id="password"
            label={t('auth.register.passwordLabel')}
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
          />

          <div className="mb-4">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">{t('auth.register.roleLabel')}</span>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update('role', value)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    form.role === value
                      ? 'border-accent-500 bg-accent-50 text-accent-700'
                      : 'border-slate-300 text-slate-500 hover:border-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p key={error} role="alert" className="animate-shake mb-4 text-sm text-red-600">
              {error}
            </p>
          )}
          <SubmitButton submitting={submitting}>
            {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
          </SubmitButton>
          <p className="mt-5 text-center text-sm text-slate-500">
            {t('auth.register.haveAccount')}{' '}
            <Link to="/login" className="font-medium text-accent-600 transition-colors hover:text-accent-700">
              {t('auth.register.loginLink')}
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  )
}
