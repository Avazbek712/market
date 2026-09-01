import type { ReactNode } from 'react'

export default function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="animate-fade-in-up w-full max-w-sm rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-xl shadow-accent-500/5 backdrop-blur">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900">{title}</h1>
        {children}
      </div>
    </div>
  )
}
