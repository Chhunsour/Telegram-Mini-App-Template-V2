import type { Product } from '@/types'

const details = {
  stock: 18,
  colors: ['ខ្មៅ', 'បេច', 'បៃតងអុលីវ'],
  variants: ['S', 'M', 'L', 'XL'],
  deliveryEstimate: '១–២ ថ្ងៃនៅភ្នំពេញ',
}

export const productCategories = ['អាវក្រៅ', 'អាវយឺត', 'ខោខូវប៊ុយ']

// These rows seed SQLite only on first run. Later edits happen through Telegram.
export const productSeeds: Product[] = [
  {
    ...details, id: 1, slug: 'classic-bomber-jacket', name: 'អាវ Bomber ក្លាស៊ិក', category: 'អាវក្រៅ',
    price: 34, discount: 24, rating: 4.8, soldCount: 184, image: '/media/jacket.webp',
    images: ['/media/jacket.webp', '/media/jacket2.webp', '/media/jacket3.webp'],
    description: 'អាវក្រៅស្រាលសម្រាប់ពាក់រាល់ថ្ងៃ ជាមួយរូបរាងសាមញ្ញ និងផាសុកភាព។', badge: 'ថ្មី', isNew: true, createdAt: '2026-07-10',
  },
  {
    ...details, id: 2, slug: 'urban-field-jacket', name: 'អាវក្រៅ Urban Field', category: 'អាវក្រៅ',
    price: 31, rating: 4.6, soldCount: 92, stock: 7, image: '/media/jacket2.webp',
    images: ['/media/jacket2.webp', '/media/jacket3.webp', '/media/jacket4.webp'],
    description: 'អាវក្រៅងាយពាក់ សមស្របសម្រាប់ពេលល្ងាចត្រជាក់។', createdAt: '2026-06-22',
  },
  {
    ...details, id: 3, slug: 'weekend-jacket', name: 'អាវក្រៅ Weekend', category: 'អាវក្រៅ',
    price: 29, rating: 4.7, soldCount: 241, image: '/media/jacket3.webp',
    images: ['/media/jacket3.webp', '/media/jacket4.webp'],
    description: 'អាវក្រៅរូបរាងទំនើប ប្រើក្រណាត់ទន់ និងប្រើបានយូរ។', badge: 'ពេញនិយម', isBestSeller: true, createdAt: '2026-05-18',
  },
  {
    ...details, id: 4, slug: 'essential-crew-tee', name: 'អាវយឺត Essential', category: 'អាវយឺត',
    price: 19, discount: 21, rating: 4.9, soldCount: 538, stock: 42, image: '/media/tshirt.webp',
    images: ['/media/tshirt.webp', '/media/tshirt1.webp'],
    description: 'អាវយឺតកប្បាស់ផាសុកភាព ចេញខ្យល់ល្អ សមស្របសម្រាប់ពាក់រាល់ថ្ងៃ។', badge: 'លក់ដាច់', isBestSeller: true, createdAt: '2026-06-01',
  },
  {
    ...details, id: 5, slug: 'relaxed-logo-tee', name: 'អាវយឺត Relaxed Logo', category: 'អាវយឺត',
    price: 18, rating: 4.5, soldCount: 136, stock: 25, image: '/media/tshirt1.webp',
    images: ['/media/tshirt1.webp', '/media/tshirt3.webp'],
    description: 'អាវយឺតធូរលុងងាយពាក់ និងប៉ះទន់។', isNew: true, createdAt: '2026-07-08',
  },
  {
    ...details, id: 6, slug: 'everyday-tee', name: 'អាវយឺត Everyday', category: 'អាវយឺត',
    price: 22, discount: 27, rating: 4.4, soldCount: 87, stock: 0, image: '/media/tshirt3.webp',
    images: ['/media/tshirt3.webp', '/media/tshirt4.webp'],
    description: 'អាវយឺតសាមញ្ញ ងាយផ្គូផ្គង និងពាក់បានគ្រប់ពេល។', badge: 'អស់ពីស្តុក', createdAt: '2026-04-11',
  },
  {
    ...details, id: 7, slug: 'straight-fit-jeans', name: 'ខោខូវប៊ុយជើងត្រង់', category: 'ខោខូវប៊ុយ',
    price: 32, discount: 22, rating: 4.8, soldCount: 327, stock: 16, colors: ['ខៀវចាស់', 'ខ្មៅ', 'ប្រផេះ'], image: '/media/jean.webp',
    images: ['/media/jean.webp', '/media/jean1.webp', '/media/jean2.webp'],
    description: 'ខោខូវប៊ុយជើងត្រង់ក្លាស៊ិក យឺតល្មមសមស្របសម្រាប់ពាក់ពេញមួយថ្ងៃ។', badge: 'បញ្ចុះតម្លៃ', isBestSeller: true, createdAt: '2026-05-27',
  },
  {
    ...details, id: 8, slug: 'tapered-denim', name: 'ខោខូវប៊ុយ Tapered', category: 'ខោខូវប៊ុយ',
    price: 28, rating: 4.6, soldCount: 119, stock: 11, colors: ['ខៀវចាស់', 'ខ្មៅ'], image: '/media/jean1.webp',
    images: ['/media/jean1.webp', '/media/jean2.webp'],
    description: 'ខោខូវប៊ុយរាងជើងរួម សអាត និងងាយពាក់រាល់ថ្ងៃ។', createdAt: '2026-06-30',
  },
  {
    ...details, id: 9, slug: 'washed-slim-jeans', name: 'ខោខូវប៊ុយ Slim Wash', category: 'ខោខូវប៊ុយ',
    price: 35, discount: 23, rating: 4.5, soldCount: 74, stock: 9, colors: ['ខៀវស្រាល'], image: '/media/jean3.webp',
    images: ['/media/jean3.webp', '/media/jean2.webp'],
    description: 'ខោខូវប៊ុយរាង Slim ជាមួយពណ៌លាងស្រាល និងក្រណាត់ទន់។', isNew: true, createdAt: '2026-07-14',
  },
]
