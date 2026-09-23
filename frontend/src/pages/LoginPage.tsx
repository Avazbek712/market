import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { extractErrorMessage } from '../api/errors'
import { useAuth } from '../auth/AuthContext'
import { DASHBOARD_PATH } from '../auth/roles'
import AuthCard from '../components/AuthCard'
import { MailIcon, LockIcon } from '../components/FieldIcons'
import FormField from '../components/FormField'
import LanguageSwitcher from '../components/LanguageSwitcher'
import SubmitButton from '../components/SubmitButton'

export default function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const justRegistered = Boolean((location.state as { registered?: boolean } | null)?.registered)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const me = await login({ email, password })
      navigate(DASHBOARD_PATH[me.role])
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-20">
        <LanguageSwitcher />
      </div>
      <AuthCard title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
        {justRegistered && (
          <p className="animate-fade-in-up mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {t('auth.login.registeredSuccess')}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <FormField
            id="email"
            label={t('auth.login.emailLabel')}
            type="email"
            icon={<MailIcon />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            wrapperClassName="animate-fade-in-up"
            wrapperStyle={{ animationDelay: '80ms' }}
            required
          />
          <FormField
            id="password"
            label={t('auth.login.passwordLabel')}
            type="password"
            icon={<LockIcon />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            wrapperClassName="animate-fade-in-up"
            wrapperStyle={{ animationDelay: '160ms' }}
            required
          />
          {error && (
            <p key={error} role="alert" className="animate-shake mb-4 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="animate-fade-in-up" style={{ animationDelay: '240ms' }}>
            <SubmitButton submitting={submitting}>
              {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
            </SubmitButton>
          </div>
          <p className="animate-fade-in-up mt-5 text-center text-sm text-slate-500" style={{ animationDelay: '300ms' }}>
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="font-medium text-accent-600 transition-colors hover:text-accent-700">
              {t('auth.login.registerLink')}
            </Link>
          </p>
        </form>
      </AuthCard>
    </div>
  )
}
