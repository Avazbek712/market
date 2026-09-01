import type { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export default function FormField({ label, id, ...inputProps }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </label>
      <input
        id={id}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition-all focus:border-accent-500 focus:ring-2 focus:ring-accent-500/30"
        {...inputProps}
      />
    </div>
  )
}
