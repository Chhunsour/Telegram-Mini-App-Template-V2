export const translations = {
  km: {
    heroBanners: [
      { image: '/media/jacket.webp', title: 'ម៉ូដថ្មីសម្រាប់រាល់ថ្ងៃ', copy: 'ផលិតផលគំរូសម្រាប់ហាងថ្មី', category: 'អាវក្រៅ' },
      { image: '/media/tshirt1.webp', title: 'តម្លៃពិសេស', copy: 'កែអត្ថបទនេះសម្រាប់អតិថិជនរបស់អ្នក', category: 'អាវយឺត' },
      { image: '/media/jean.webp', title: 'ដឹកជញ្ជូនទូទាំងកម្ពុជា', copy: 'បង់ប្រាក់ពេលទទួលទំនិញ', category: 'ខោខូវប៊ុយ' },
    ],
    checkout: {
      title: 'ទូទាត់', eyebrow: 'ព័ត៌មានអតិថិជន', intro: 'បំពេញព័ត៌មាន រួចពិនិត្យម្តងទៀតមុនបញ្ជូនការទិញ។',
      demoTitle: 'ហាងគំរូ', demoCopy: 'ប្ដូរអត្ថបទនេះក្នុង translations.ts។', customer: 'អតិថិជន', fullName: 'ឈ្មោះពេញ', phone: 'លេខទូរស័ព្ទ',
      deliveryAddress: 'អាសយដ្ឋានដឹកជញ្ជូន', province: 'រាជធានី ឬខេត្ត', address: 'អាសយដ្ឋាន', deliveryMethod: 'វិធីដឹកជញ្ជូន', standardDelivery: 'ដឹកជញ្ជូនធម្មតា', pickup: 'ទទួលនៅហាង',
      paymentMethod: 'វិធីទូទាត់', cod: 'បង់ពេលទទួលទំនិញ', codHelp: 'បង់ប្រាក់ជូនអ្នកដឹកជញ្ជូនពេលទទួលទំនិញ', unavailable: 'មិនទាន់បើកប្រើ',
      note: 'កំណត់ចំណាំ', optional: 'មិនចាំបាច់', notePlaceholder: 'ពេលដឹក ទីតាំងគោល ឬសំណើពិសេស', reviewOrder: 'បន្តពិនិត្យ', finalReview: 'ពិនិត្យចុងក្រោយ', confirmHeading: 'បញ្ជាក់ការបញ្ជាទិញ', unsent: 'ការទិញនៅមិនទាន់បានផ្ញើទេ។',
      quantity: 'ចំនួន', total: 'សរុប', confirm: 'បញ្ជាក់', edit: 'កែប្រែ', cancel: 'បោះបង់', sending: 'កំពុងផ្ញើ…', sendError: 'មិនអាចផ្ញើការបញ្ជាទិញបានទេ។ សូមព្យាយាមម្តងទៀត។', cartSummary: 'សរុបការបញ្ជាទិញ', empty: 'មិនមានទំនិញសម្រាប់ទូទាត់', browse: 'មើលទំនិញ', free: 'ឥតគិតថ្លៃ', subtotal: 'តម្លៃទំនិញ', discount: 'បញ្ចុះតម្លៃ', delivery: 'ដឹកជញ្ជូន', telegramOnly: 'សូមបើកហាងនេះពីក្នុង Telegram ដើម្បីដាក់ការបញ្ជាទិញ។',
    },
    bot: {
      welcome: 'សូមស្វាគមន៍មកកាន់ {store}', received: 'ហាងបានទទួលការទិញរបស់អ្នក។', completed: 'អរគុណដែលបានទិញទំនិញពី {store}។', contact: 'ទំនាក់ទំនង',
    },
    ui: {
      nav: { home: 'ទំព័រដើម', products: 'ទំនិញ', cart: 'កន្រ្តក', orders: 'ការបញ្ជាទិញ', contact: 'ជំនួយ និងទំនាក់ទំនង', shopInTelegram: 'ទិញទំនិញផ្ទាល់នៅក្នុង Telegram', openMenu: 'បើកមឺនុយ', closeMenu: 'បិទមឺនុយ', openCart: 'បើកកន្រ្តក', closeCart: 'បិទកន្រ្តក' },
      common: { browse: 'មើលទំនិញ', viewAll: 'មើលទាំងអស់', total: 'សរុប', checkout: 'ទូទាត់', free: 'ឥតគិតថ្លៃ', subtotal: 'តម្លៃទំនិញ', discount: 'បញ្ចុះតម្លៃ', delivery: 'ថ្លៃដឹកជញ្ជូន', quantity: 'ចំនួន', remove: 'ដកចេញ', addCart: 'ដាក់ចូលកន្រ្តក', outOfStock: 'អស់ពីស្តុក', inStock: 'នៅសល់', sold: 'លក់បាន', contactStore: 'ទំនាក់ទំនងហាង' },
      home: { search: 'ស្វែងរកទំនិញ', searchPlaceholder: 'ស្វែងរកទំនិញ ឬប្រភេទ', results: 'លទ្ធផលស្វែងរក', noResults: 'រកមិនឃើញទំនិញ', categories: 'ប្រភេទទំនិញ', bestSellers: 'ទំនិញលក់ដាច់', popular: 'ពេញនិយម', offers: 'ការផ្តល់ជូន', support: 'ជំនួយពីហាង', openTelegram: 'បើក Telegram', fastFind: 'ស្វែងរកលឿន', saleTitle: 'ទំនិញល្អ តម្លៃកាន់តែប្រសើរ', saleCopy: 'ស្វែងរកទំនិញបញ្ចុះតម្លៃថ្ងៃនេះ។' },
      cart: { title: 'កន្រ្តកទំនិញ', eyebrow: 'ទំនិញរបស់អ្នក', intro: 'ពិនិត្យទំនិញ ចំនួន ថ្លៃដឹកជញ្ជូន និងតម្លៃសរុប។', empty: 'កន្រ្តករបស់អ្នកនៅទទេ។', voucher: 'លេខកូដបញ្ចុះតម្លៃ', apply: 'ប្រើ', startShopping: 'ចាប់ផ្តើមទិញ', viewCart: 'មើលកន្រ្តក', voucherApplied: 'បានបញ្ចុះតម្លៃ ១០%។', voucherInvalid: 'លេខកូដមិនត្រឹមត្រូវ។' },
      catalog: { title: 'មើលទំនិញ', eyebrow: 'កាតាឡុក', intro: 'ស្វែងរកតាមប្រភេទ ស្តុក តម្លៃ ឬប្រជាប្រិយភាព។', filters: 'តម្រង', reset: 'កំណត់ឡើងវិញ', category: 'ប្រភេទ', all: 'ទាំងអស់', maxPrice: 'តម្លៃអតិបរមា', inStock: 'មានក្នុងស្តុក', new: 'ទំនិញថ្មី', best: 'លក់ដាច់', discounted: 'បញ្ចុះតម្លៃ', sort: 'តម្រៀប', none: 'មិនមានទំនិញផ្គូផ្គង', recommended: 'ណែនាំ', newest: 'ថ្មីបំផុត', low: 'តម្លៃទាប', high: 'តម្លៃខ្ពស់', popular: 'ពេញនិយម' },
      product: { color: 'ពណ៌', size: 'ទំហំ', buyNow: 'ទិញឥឡូវ', saved: 'បានរក្សាទុក', favorite: 'ពេញចិត្ត', deliveryTime: 'ពេលដឹកជញ្ជូន', notFound: 'រកមិនឃើញទំនិញ', related: 'ទំនិញពាក់ព័ន្ធ' },
      orders: { title: 'ការបញ្ជាទិញរបស់អ្នក', history: 'ប្រវត្តិការទិញ', details: 'មើលព័ត៌មាន', hide: 'លាក់ព័ត៌មាន', empty: 'មិនទាន់មានការបញ្ជាទិញ', payment: 'វិធីទូទាត់', paymentStatus: 'ស្ថានភាពទូទាត់', deliveryStatus: 'ស្ថានភាពដឹកជញ្ជូន', status: { Pending: 'កំពុងរង់ចាំ', Confirmed: 'បានបញ្ជាក់', Preparing: 'កំពុងរៀបចំ', Shipping: 'កំពុងដឹកជញ្ជូន', Delivered: 'បានដឹកដល់', Cancelled: 'បានលុប', Unpaid: 'មិនទាន់បង់', Paid: 'បានបង់', Refunded: 'បានសងប្រាក់' } },
      confirmation: { submitted: 'បានផ្ញើ', title: 'ការទិញបានបញ្ជូន', message: 'ការបញ្ជាទិញបានផ្ញើដោយជោគជ័យ។', openTelegram: 'បើក Telegram', continue: 'បន្តទិញទំនិញ' },
      contact: { title: 'ទំនាក់ទំនងហាង', eyebrow: 'ជំនួយអតិថិជន', intro: 'ទាក់ទងយើងតាម Telegram ឬទូរស័ព្ទ។', information: 'ព័ត៌មានហាង', phone: 'ទូរស័ព្ទ', address: 'អាសយដ្ឋាន', message: 'ផ្ញើសាទាក់ទង', call: 'ហៅទូរស័ព្ទ', policies: 'គោលការណ៍' },
      notFound: { title: 'រកមិនឃើញទំព័រ', copy: 'ត្រឡប់ទៅហាង ឬមើលទំនិញដែលមាន។' },
    },
  },
  en: {
    heroBanners: [
      { image: '/media/jacket.webp', title: 'New everyday styles', copy: 'Placeholder products for a new store', category: 'អាវក្រៅ' },
      { image: '/media/tshirt1.webp', title: 'Special prices', copy: 'Customize this text for your customer', category: 'អាវយឺត' },
      { image: '/media/jean.webp', title: 'Delivery across Cambodia', copy: 'Cash on Delivery available', category: 'ខោខូវប៊ុយ' },
    ],
    checkout: {
      title: 'Checkout', eyebrow: 'Customer information', intro: 'Complete your details, then review before sending the order.',
      demoTitle: 'Demo store', demoCopy: 'Customize this text in translations.ts.', customer: 'Customer', fullName: 'Full name', phone: 'Phone number', deliveryAddress: 'Delivery address', province: 'City or province', address: 'Address', deliveryMethod: 'Delivery method', standardDelivery: 'Standard delivery', pickup: 'Store pickup', paymentMethod: 'Payment method', cod: 'Cash on Delivery', codHelp: 'Pay the courier when your order arrives', unavailable: 'Not available yet', note: 'Order note', optional: 'Optional', notePlaceholder: 'Delivery time, landmark, or special request', reviewOrder: 'Review Order', finalReview: 'Final review', confirmHeading: 'Confirm Order', unsent: 'Your order has not been sent yet.', quantity: 'Qty', total: 'Total', confirm: 'Confirm Order', edit: 'Edit Order', cancel: 'Cancel Order', sending: 'Sending…', sendError: 'Could not submit. Please try again.', cartSummary: 'Order summary', empty: 'No products to checkout', browse: 'Browse products', free: 'Free', subtotal: 'Subtotal', discount: 'Discount', delivery: 'Delivery', telegramOnly: 'Open this store inside Telegram to place an order.',
    },
    bot: {
      welcome: 'Welcome to {store}', received: 'The store received your order.', completed: 'Thank you for shopping with {store}.', contact: 'Contact',
    },
    ui: {
      nav: { home: 'Home', products: 'Products', cart: 'Cart', orders: 'Orders', contact: 'Help & contact', shopInTelegram: 'Shop directly inside Telegram', openMenu: 'Open menu', closeMenu: 'Close menu', openCart: 'Open cart', closeCart: 'Close cart' },
      common: { browse: 'Browse products', viewAll: 'View all', total: 'Total', checkout: 'Checkout', free: 'Free', subtotal: 'Subtotal', discount: 'Discount', delivery: 'Delivery fee', quantity: 'Quantity', remove: 'Remove', addCart: 'Add to cart', outOfStock: 'Out of stock', inStock: 'In stock', sold: 'Sold', contactStore: 'Contact store' },
      home: { search: 'Search products', searchPlaceholder: 'Search products or categories', results: 'Search results', noResults: 'No products found', categories: 'Categories', bestSellers: 'Best sellers', popular: 'Popular', offers: 'Offers', support: 'Store support', openTelegram: 'Open Telegram', fastFind: 'Quick find', saleTitle: 'Better products, better prices', saleCopy: 'Browse today’s discounted products.' },
      cart: { title: 'Shopping cart', eyebrow: 'Your products', intro: 'Review products, quantities, delivery, and total.', empty: 'Your cart is empty.', voucher: 'Discount code', apply: 'Apply', startShopping: 'Start shopping', viewCart: 'View cart', voucherApplied: '10% discount applied.', voucherInvalid: 'Invalid discount code.' },
      catalog: { title: 'Browse products', eyebrow: 'Catalog', intro: 'Filter by category, stock, price, or popularity.', filters: 'Filters', reset: 'Reset', category: 'Category', all: 'All', maxPrice: 'Maximum price', inStock: 'In stock', new: 'New products', best: 'Best sellers', discounted: 'Discounted', sort: 'Sort', none: 'No matching products', recommended: 'Recommended', newest: 'Newest', low: 'Lowest price', high: 'Highest price', popular: 'Popular' },
      product: { color: 'Color', size: 'Size', buyNow: 'Buy now', saved: 'Saved', favorite: 'Favorite', deliveryTime: 'Delivery time', notFound: 'Product not found', related: 'Related products' },
      orders: { title: 'Your orders', history: 'Order history', details: 'View details', hide: 'Hide details', empty: 'No orders yet', payment: 'Payment method', paymentStatus: 'Payment status', deliveryStatus: 'Delivery status', status: { Pending: 'Pending', Confirmed: 'Confirmed', Preparing: 'Preparing', Shipping: 'Shipping', Delivered: 'Delivered', Cancelled: 'Cancelled', Unpaid: 'Unpaid', Paid: 'Paid', Refunded: 'Refunded' } },
      confirmation: { submitted: 'Order submitted', title: 'Order sent', message: 'Your confirmed order was sent successfully.', openTelegram: 'Open Telegram', continue: 'Continue shopping' },
      contact: { title: 'Contact store', eyebrow: 'Customer support', intro: 'Contact us through Telegram or phone.', information: 'Store information', phone: 'Phone', address: 'Address', message: 'Send message', call: 'Call', policies: 'Policies' },
      notFound: { title: 'Page not found', copy: 'Return to the store or browse available products.' },
    },
  },
} as const
