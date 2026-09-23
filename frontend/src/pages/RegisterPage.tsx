import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import type { RegisterPayload } from '../api/auth'
import { extractErrorMessage } from '../api/errors'
import { useAuth } from '../auth/AuthContext'
import AuthCard from '../components/AuthCard'
import { MailIcon, LockIcon, UserIcon } from '../components/FieldIcons'
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
      <div className="absolute right-4 top-4 z-20">
        <LanguageSwitcher />
      </div>
      <AuthCard title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
        <form onSubmit={handleSubmit}>
          <FormField
            id="fullName"
            label={t('auth.register.fullNameLabel')}
            icon={<UserIcon />}
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            wrapperClassName="animate-fade-in-up"
            wrapperStyle={{ animationDelay: '80ms' }}
            required
          />
          <FormField
            id="email"
            label={t('auth.register.emailLabel')}
            type="email"
            icon={<MailIcon />}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            wrapperClassName="animate-fade-in-up"
            wrapperStyle={{ animationDelay: '140ms' }}
            required
          />
          <FormField
            id="password"
            label={t('auth.register.passwordLabel')}
            type="password"
            icon={<LockIcon />}
            minLength={8}
            maxLength={72}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            wrapperClassName="animate-fade-in-up"
            wrapperStyle={{ animationDelay: '200ms' }}
            required
          />

          <div className="animate-fade-in-up mb-4" style={{ animationDelay: '260ms' }}>
            <span className="mb-1.5 block text-sm font-medium text-slate-600">{t('auth.register.roleLabel')}</span>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update('role', value)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    form.role === value
                      ? 'border-accent-500 bg-accent-50 text-accent-700 shadow-sm shadow-accent-500/20'
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
          <div className="animate-fade-in-up" style={{ animationDelay: '320ms' }}>
            <SubmitButton submitting={submitting}>
              {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
            </SubmitButton>
          </div>
          <p className="animate-fade-in-up mt-5 text-center text-sm text-slate-500" style={{ animationDelay: '380ms' }}>
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
