import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../i18n'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="inline-flex rounded-lg border border-slate-300 p-0.5 text-sm">
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          className={`rounded-md px-2.5 py-1 font-medium uppercase transition-colors ${
            i18n.resolvedLanguage === lng ? 'bg-accent-500 text-white' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {lng}
        </button>
      ))}
    </div>
  )
}
