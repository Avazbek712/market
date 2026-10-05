import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import * as categoriesApi from '../api/categories'
import type { Category } from '../api/categories'
import { extractErrorMessage } from '../api/errors'
import * as productsApi from '../api/products'
import type { Product } from '../api/products'
import { PencilIcon, PlusIcon, TrashIcon, XIcon } from './ActionIcons'
import { BoxIcon } from './DecorativeIcons'
import FormField from './FormField'
import SubmitButton from './SubmitButton'

interface FormState {
  name: string
  description: string
  price: string
  quantity: string
  categoryId: string
}

const EMPTY_FORM: FormState = { name: '', description: '', price: '', quantity: '', categoryId: '' }

// Mirrors spring.servlet.multipart.* limits on the backend — checked here only to fail
// fast without uploading; the backend and nginx still enforce them.
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_TOTAL_BYTES = 50 * 1024 * 1024

function imagesExceedLimits(images: File[]) {
  const total = images.reduce((sum, file) => sum + file.size, 0)
  return total > MAX_TOTAL_BYTES || images.some((file) => file.size > MAX_IMAGE_BYTES)
}

function CategorySelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: Category[]
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition-all duration-200 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/15"
      >
        <option value="">—</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function ProductManager() {
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[] | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(EMPTY_FORM)
  const [addImages, setAddImages] = useState<File[]>([])
  const [addSubmitting, setAddSubmitting] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null)
  const [deleteSubmittingId, setDeleteSubmittingId] = useState<number | null>(null)

  useEffect(() => {
    void loadProducts()
    void loadCategories()
  }, [])

  async function loadProducts() {
    try {
      const page = await productsApi.listMyProducts()
      setProducts(page.content)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function loadCategories() {
    try {
      setCategories(await categoriesApi.listCategories())
    } catch {
      // Category dropdown is optional context — a failed load here shouldn't block product management.
    }
  }

  function toPayload(form: FormState): productsApi.ProductPayload {
    return {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      quantity: Number(form.quantity),
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
    }
  }

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    setAddImages(Array.from(event.target.files ?? []))
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (imagesExceedLimits(addImages)) {
      setError(t('errors.FILE_TOO_LARGE'))
      return
    }
    setAddSubmitting(true)
    try {
      const created = await productsApi.createProduct(toPayload(addForm), addImages)
      setProducts((prev) => [...(prev ?? []), created])
      setAddForm(EMPTY_FORM)
      setAddImages([])
      setShowAddForm(false)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setAddSubmitting(false)
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id)
    setEditForm({
      name: product.name,
      description: product.description ?? '',
      price: String(product.price),
      quantity: String(product.quantity),
      categoryId: product.categoryId != null ? String(product.categoryId) : '',
    })
    setConfirmingDeleteId(null)
  }

  async function handleEdit(event: FormEvent, id: number) {
    event.preventDefault()
    setError(null)
    setEditSubmitting(true)
    try {
      const updated = await productsApi.updateProduct(id, toPayload(editForm))
      setProducts((prev) => prev?.map((p) => (p.id === id ? updated : p)) ?? null)
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
      await productsApi.deleteProduct(id)
      setProducts((prev) => prev?.filter((p) => p.id !== id) ?? null)
      setConfirmingDeleteId(null)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setDeleteSubmittingId(null)
    }
  }

  function categoryName(categoryId: number | null) {
    return categories.find((c) => c.id === categoryId)?.name
  }

  function renderRow(product: Product, index: number) {
    return (
      <li
        key={product.id}
        className="animate-fade-in-up rounded-xl border border-slate-200 px-4 py-3"
        style={{ animationDelay: `${Math.min(index * 40, 320)}ms` }}
      >
        {editingId === product.id ? (
          <form onSubmit={(e) => handleEdit(e, product.id)}>
            <FormField
              id={`edit-name-${product.id}`}
              label={t('dashboard.seller.products.nameLabel')}
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <FormField
              id={`edit-description-${product.id}`}
              label={t('dashboard.seller.products.descriptionLabel')}
              value={editForm.description}
              onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                id={`edit-price-${product.id}`}
                type="number"
                step="0.01"
                min="0"
                label={t('dashboard.seller.products.priceLabel')}
                value={editForm.price}
                onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                required
              />
              <FormField
                id={`edit-quantity-${product.id}`}
                type="number"
                min="0"
                label={t('dashboard.seller.products.quantityLabel')}
                value={editForm.quantity}
                onChange={(e) => setEditForm((prev) => ({ ...prev, quantity: e.target.value }))}
                required
              />
            </div>
            <CategorySelect
              id={`edit-category-${product.id}`}
              label={t('dashboard.seller.products.categoryLabel')}
              value={editForm.categoryId}
              onChange={(value) => setEditForm((prev) => ({ ...prev, categoryId: value }))}
              options={categories}
            />
            <div className="flex gap-2">
              <SubmitButton submitting={editSubmitting}>
                {editSubmitting ? t('dashboard.seller.products.saving') : t('dashboard.seller.products.save')}
              </SubmitButton>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                {t('dashboard.seller.products.cancel')}
              </button>
            </div>
          </form>
        ) : confirmingDeleteId === product.id ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-700">
              {t('dashboard.seller.products.confirmDelete', { name: product.name })}
            </span>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => handleDelete(product.id)}
                disabled={deleteSubmittingId === product.id}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {t('dashboard.seller.products.confirmDeleteYes')}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDeleteId(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                {t('dashboard.seller.products.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {product.imageIds.length > 0 ? (
                <img
                  src={productsApi.fileUrl(product.imageIds[0])}
                  alt={product.name}
                  className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                  <BoxIcon className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{product.name}</p>
                <p className="truncate text-sm text-slate-500">
                  {t('dashboard.seller.products.priceAndQty', { price: product.price, count: product.quantity })}
                  {categoryName(product.categoryId) ? ` · ${categoryName(product.categoryId)}` : ''}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => startEdit(product)}
                aria-label={t('dashboard.seller.products.edit')}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-accent-50 hover:text-accent-600"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDeleteId(product.id)}
                aria-label={t('dashboard.seller.products.delete')}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </li>
    )
  }

  return (
    <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
            <BoxIcon className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.seller.products.title')}</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-lg bg-accent-500 px-3 py-1.5 text-sm font-medium text-white transition-all hover:bg-accent-600 active:scale-[0.98]"
        >
          {showAddForm ? <XIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
          {t('dashboard.seller.products.addButton')}
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
            id="new-product-name"
            label={t('dashboard.seller.products.nameLabel')}
            value={addForm.name}
            onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <FormField
            id="new-product-description"
            label={t('dashboard.seller.products.descriptionLabel')}
            value={addForm.description}
            onChange={(e) => setAddForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              id="new-product-price"
              type="number"
              step="0.01"
              min="0"
              label={t('dashboard.seller.products.priceLabel')}
              value={addForm.price}
              onChange={(e) => setAddForm((prev) => ({ ...prev, price: e.target.value }))}
              required
            />
            <FormField
              id="new-product-quantity"
              type="number"
              min="0"
              label={t('dashboard.seller.products.quantityLabel')}
              value={addForm.quantity}
              onChange={(e) => setAddForm((prev) => ({ ...prev, quantity: e.target.value }))}
              required
            />
          </div>
          <CategorySelect
            id="new-product-category"
            label={t('dashboard.seller.products.categoryLabel')}
            value={addForm.categoryId}
            onChange={(value) => setAddForm((prev) => ({ ...prev, categoryId: value }))}
            options={categories}
          />
          <div className="mb-4">
            <label htmlFor="new-product-images" className="mb-1.5 block text-sm font-medium text-slate-600">
              {t('dashboard.seller.products.imagesLabel')}
            </label>
            <input
              id="new-product-images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-accent-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-600"
            />
          </div>
          <SubmitButton submitting={addSubmitting}>
            {addSubmitting ? t('dashboard.seller.products.saving') : t('dashboard.seller.products.save')}
          </SubmitButton>
        </form>
      )}

      {products === null && (
        <p className="py-6 text-center text-sm text-slate-500">{t('dashboard.seller.products.loading')}</p>
      )}

      {products !== null && products.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-500">{t('dashboard.seller.products.empty')}</p>
      )}

      <ul className="space-y-2">{products?.map((product, index) => renderRow(product, index))}</ul>
    </div>
  )
}
