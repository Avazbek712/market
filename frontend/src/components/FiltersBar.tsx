import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Category } from '../api/categories'
import { SearchIcon } from './ActionIcons'

export type SortOption = 'newest' | 'priceAsc' | 'priceDesc'

export const SORT_PARAM: Record<SortOption, string> = {
  newest: 'createdAt,desc',
  priceAsc: 'price,asc',
  priceDesc: 'price,desc',
}

export interface Filters {
  categoryId: string
  search: string
  minPrice: string
  maxPrice: string
  sort: SortOption
}

export const EMPTY_FILTERS: Filters = { categoryId: '', search: '', minPrice: '', maxPrice: '', sort: 'newest' }

const INPUT_CLASSES =
  'rounded-xl border border-border-strong bg-surface-raised text-content-primary outline-none transition-all duration-200 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/15'
const LABEL_CLASSES = 'mb-1.5 block text-sm font-medium text-content-secondary'

export default function FiltersBar({
  categories,
  filters,
  onChange,
}: {
  categories: Category[]
  filters: Filters
  onChange: (filters: Filters) => void
}) {
  const { t } = useTranslation()
  const [searchInput, setSearchInput] = useState(filters.search)

  // Debounce the search box so we don't fire a request on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== filters.search) {
        onChange({ ...filters, search: searchInput })
      }
    }, 300)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-border-subtle bg-surface-raised/80 p-4 backdrop-blur">
      <div className="min-w-[200px] flex-1">
        <label htmlFor="filter-search" className={LABEL_CLASSES}>
          {t('catalog.filters.searchLabel')}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-content-secondary">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            id="filter-search"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('catalog.filters.searchPlaceholder')}
            className={`w-full py-2.5 pl-10 pr-3 ${INPUT_CLASSES}`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="filter-category" className={LABEL_CLASSES}>
          {t('catalog.filters.categoryLabel')}
        </label>
        <select
          id="filter-category"
          value={filters.categoryId}
          onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
          className={`px-3 py-2.5 ${INPUT_CLASSES}`}
        >
          <option value="">{t('catalog.filters.categoryAll')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2">
        <div>
          <label htmlFor="filter-min-price" className={LABEL_CLASSES}>
            {t('catalog.filters.minPriceLabel')}
          </label>
          <input
            id="filter-min-price"
            type="number"
            min="0"
            step="0.01"
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className={`w-24 px-3 py-2.5 ${INPUT_CLASSES}`}
          />
        </div>
        <div>
          <label htmlFor="filter-max-price" className={LABEL_CLASSES}>
            {t('catalog.filters.maxPriceLabel')}
          </label>
          <input
            id="filter-max-price"
            type="number"
            min="0"
            step="0.01"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className={`w-24 px-3 py-2.5 ${INPUT_CLASSES}`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="filter-sort" className={LABEL_CLASSES}>
          {t('catalog.filters.sortLabel')}
        </label>
        <select
          id="filter-sort"
          value={filters.sort}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SortOption })}
          className={`px-3 py-2.5 ${INPUT_CLASSES}`}
        >
          <option value="newest">{t('catalog.filters.sortNewest')}</option>
          <option value="priceAsc">{t('catalog.filters.sortPriceAsc')}</option>
          <option value="priceDesc">{t('catalog.filters.sortPriceDesc')}</option>
        </select>
      </div>
    </div>
  )
}
