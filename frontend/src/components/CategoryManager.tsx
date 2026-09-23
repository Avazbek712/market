import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import * as categoriesApi from '../api/categories'
import type { Category } from '../api/categories'
import { extractErrorMessage } from '../api/errors'
import { PencilIcon, PlusIcon, TrashIcon, XIcon } from './ActionIcons'
import { TagIcon } from './DecorativeIcons'
import FormField from './FormField'
import SubmitButton from './SubmitButton'

interface FormState {
  name: string
  description: string
}

const EMPTY_FORM: FormState = { name: '', description: '' }

export default function CategoryManager() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(EMPTY_FORM)
  const [addSubmitting, setAddSubmitting] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null)
  const [deleteSubmittingId, setDeleteSubmittingId] = useState<number | null>(null)

  useEffect(() => {
    void loadCategories()
  }, [])

  async function loadCategories() {
    try {
      setCategories(await categoriesApi.listCategories())
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  function toPayload(form: FormState): categoriesApi.CategoryPayload {
    return {
      categoryName: form.name,
      categoryDescription: form.description || undefined,
    }
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setAddSubmitting(true)
    try {
      const created = await categoriesApi.createCategory(toPayload(addForm))
      setCategories((prev) => [...(prev ?? []), created])
      setAddForm(EMPTY_FORM)
      setShowAddForm(false)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setAddSubmitting(false)
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id)
    setEditForm({ name: category.name, description: category.description ?? '' })
    setConfirmingDeleteId(null)
  }

  async function handleEdit(event: FormEvent, id: number) {
    event.preventDefault()
    setError(null)
    setEditSubmitting(true)
    try {
      const updated = await categoriesApi.updateCategory(id, toPayload(editForm))
      setCategories((prev) => prev?.map((c) => (c.id === id ? updated : c)) ?? null)
      setEditingId(null)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    setDeleteSubmittingId(id)
    try {
      await categoriesApi.deleteCategory(id)
      setCategories((prev) => prev?.filter((c) => c.id !== id) ?? null)
      setConfirmingDeleteId(null)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setDeleteSubmittingId(null)
    }
  }

  return (
    <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
            <TagIcon className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.admin.categories.title')}</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-lg bg-accent-500 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-accent-600 active:scale-[0.98]"
        >
          {showAddForm ? <XIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
          {t('dashboard.admin.categories.addButton')}
        </button>
      </div>

      {error && (
        <p key={error} role="alert" className="animate-shake mb-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="animate-fade-in-up mb-5 rounded-xl border border-accent-200 bg-accent-50/40 p-4"
        >
          <FormField
            id="new-category-name"
            label={t('dashboard.admin.categories.nameLabel')}
            value={addForm.name}
            onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <FormField
            id="new-category-description"
            label={t('dashboard.admin.categories.descriptionLabel')}
            value={addForm.description}
            onChange={(e) => setAddForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <SubmitButton submitting={addSubmitting}>
            {addSubmitting ? t('dashboard.admin.categories.saving') : t('dashboard.admin.categories.save')}
          </SubmitButton>
        </form>
      )}

      {categories === null && (
        <p className="py-6 text-center text-sm text-slate-500">{t('dashboard.admin.categories.loading')}</p>
      )}

      {categories !== null && categories.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-500">{t('dashboard.admin.categories.empty')}</p>
      )}

      <ul className="space-y-2">
        {categories?.map((category, index) => (
          <li
            key={category.id}
            className="animate-fade-in-up rounded-xl border border-slate-200 px-4 py-3"
            style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
          >
            {editingId === category.id ? (
              <form onSubmit={(e) => handleEdit(e, category.id)}>
                <FormField
                  id={`edit-name-${category.id}`}
                  label={t('dashboard.admin.categories.nameLabel')}
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
                <FormField
                  id={`edit-description-${category.id}`}
                  label={t('dashboard.admin.categories.descriptionLabel')}
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex gap-2">
                  <SubmitButton submitting={editSubmitting}>
                    {editSubmitting ? t('dashboard.admin.categories.saving') : t('dashboard.admin.categories.save')}
                  </SubmitButton>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    {t('dashboard.admin.categories.cancel')}
                  </button>
                </div>
              </form>
            ) : confirmingDeleteId === category.id ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-700">
                  {t('dashboard.admin.categories.confirmDelete', { name: category.name })}
                </span>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(category.id)}
                    disabled={deleteSubmittingId === category.id}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60"
                  >
                    {t('dashboard.admin.categories.confirmDeleteYes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDeleteId(null)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    {t('dashboard.admin.categories.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <TagIcon className="h-4 w-4 shrink-0 text-accent-500" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{category.name}</p>
                    {category.description && (
                      <p className="truncate text-sm text-slate-500">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(category)}
                    aria-label={t('dashboard.admin.categories.edit')}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-accent-50 hover:text-accent-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDeleteId(category.id)}
                    aria-label={t('dashboard.admin.categories.delete')}
                    className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
