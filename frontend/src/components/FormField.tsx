import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: ReactNode
  wrapperClassName?: string
  wrapperStyle?: CSSProperties
}

export default function FormField({
  label,
  id,
  icon,
  wrapperClassName,
  wrapperStyle,
  ...inputProps
}: FormFieldProps) {
  return (
    <div className={`mb-4 ${wrapperClassName ?? ''}`} style={wrapperStyle}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={`w-full rounded-xl border border-slate-300 py-2.5 text-slate-900 outline-none transition-all duration-200 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/15 ${
            icon ? 'pl-10 pr-3' : 'px-3'
          }`}
          {...inputProps}
        />
      </div>
    </div>
  )
}
