import type { Product } from '../types/index.ts'

export interface CatalogFilters {
  category: string
  maxPrice: number
  inStock: boolean
  newOnly: boolean
  bestOnly: boolean
  discountedOnly: boolean
  sort: 'recommended' | 'newest' | 'low' | 'high' | 'popular'
}

export function filterProducts(products: Product[], filters: CatalogFilters) {
  const filtered = products.filter((product) =>
    (!filters.category || product.category === filters.category) &&
    product.price <= filters.maxPrice &&
    (!filters.inStock || product.stock > 0) &&
    (!filters.newOnly || product.isNew) &&
    (!filters.bestOnly || product.isBestSeller) &&
    (!filters.discountedOnly || Boolean(product.oldPrice)))

  return filtered.sort((a, b) => {
    if (filters.sort === 'newest') return Date.parse(b.createdAt) - Date.parse(a.createdAt)
    if (filters.sort === 'low') return a.price - b.price
    if (filters.sort === 'high') return b.price - a.price
    if (filters.sort === 'popular') return b.soldCount - a.soldCount
    return Number(Boolean(b.isBestSeller)) - Number(Boolean(a.isBestSeller)) || b.rating - a.rating
  })
}
