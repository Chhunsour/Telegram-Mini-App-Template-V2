import { strict as assert } from 'node:assert'
import { filterProducts } from '../src/services/catalog.ts'

const products = [
  { id: 1, category: 'A', price: 20, stock: 1, isNew: true, isBestSeller: false, oldPrice: 25, soldCount: 5, rating: 4, createdAt: '2026-01-01' },
  { id: 2, category: 'B', price: 10, stock: 0, isNew: false, isBestSeller: true, soldCount: 20, rating: 5, createdAt: '2026-02-01' },
] as never[]

assert.deepEqual(filterProducts(products, { category: 'A', maxPrice: 30, inStock: true, newOnly: false, bestOnly: false, discountedOnly: true, sort: 'low' }).map(({ id }) => id), [1])
assert.deepEqual(filterProducts(products, { category: '', maxPrice: 30, inStock: false, newOnly: false, bestOnly: false, discountedOnly: false, sort: 'popular' }).map(({ id }) => id), [2, 1])
console.log('Catalog filtering check passed')
