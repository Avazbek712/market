import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from '../i18n'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="inline-flex rounded-lg border border-slate-200/80 bg-white/70 p-0.5 text-sm shadow-sm backdrop-blur-md">
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => i18n.changeLanguage(lng)}
          aria-pressed={i18n.resolvedLanguage === lng}
          className={`rounded-md px-2.5 py-1 font-medium uppercase transition-all duration-200 ${
            i18n.resolvedLanguage === lng
              ? 'bg-accent-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {lng}
        </button>
      ))}
    </div>
  )
}
