export const storeConfig = {
  id: 'demo-store',
  orderIdPrefix: 'ORD',
  storeName: 'Demo Shop',
  shortName: 'Demo',
  description: 'A reusable Telegram Mini App storefront.',
  logo: '/branding/demo-logo.png',
  favicon: '/branding/demo-logo.png',
  defaultLocale: 'km' as 'km' | 'en',
  currency: 'USD' as const,
  contact: {
    phone: '+855 10 000 000',
    email: 'hello@example.com',
    address: 'Phnom Penh, Cambodia',
  },
  delivery: {
    fee: 2.5,
    freeFrom: 50,
    estimateKm: '១–៣ ថ្ងៃ',
    estimateEn: '1–3 days',
    provinces: ['ភ្នំពេញ', 'កណ្តាល', 'សៀមរាប', 'បាត់ដំបង', 'កំពង់ចាម', 'ព្រះសីហនុ', 'ខេត្តផ្សេង'],
  },
  checkoutDefaults: {
    customerName: 'Demo Customer',
    phone: '010 000 000',
    address: 'Street and house number',
  },
  promotion: {
    code: 'DEMO10',
    discountPercent: 10,
  },
  telegram: {
    botUsername: '@YourStoreBot',
  },
  social: {
    facebook: 'https://facebook.com/your-store',
    instagram: 'https://instagram.com/your-store',
    tiktok: 'https://tiktok.com/@your-store',
  },
  policies: [
    { titleKm: 'ការដឹកជញ្ជូន', titleEn: 'Delivery', textKm: 'ការដឹកជញ្ជូនទូទាំងកម្ពុជា។', textEn: 'Delivery is available across Cambodia.' },
    { titleKm: 'ការប្តូរទំនិញ', titleEn: 'Returns', textKm: 'ទាក់ទងហាងក្នុងរយៈពេល ៧ ថ្ងៃ។', textEn: 'Contact the store within 7 days.' },
    { titleKm: 'ការទូទាត់', titleEn: 'Payment', textKm: 'បង់ប្រាក់ពេលទទួលទំនិញ។', textEn: 'Cash on Delivery is supported.' },
  ],
} as const
