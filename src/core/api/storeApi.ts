import { supabase } from '../supabase/client'
import type { CategoryItem, Product, Order, StoreConfig } from '@/types'
import { storeConfig as defaultStoreConfig } from '@/config/store.config'
import { productSeeds } from '@/config/products'

export const ACTIVE_STORE_SLUG = import.meta.env.VITE_STORE_SLUG || 'tovmuk-demo'

export async function fetchStoreBySlug(slug: string = ACTIVE_STORE_SLUG): Promise<StoreConfig> {
  try {
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !store) {
      return defaultStoreConfig as unknown as StoreConfig
    }

    return {
      id: store.id,
      slug: store.slug,
      orderIdPrefix: store.order_id_prefix || defaultStoreConfig.orderIdPrefix,
      storeName: store.name || defaultStoreConfig.storeName,
      shortName: store.short_name || defaultStoreConfig.shortName,
      description: store.description || defaultStoreConfig.description,
      logo: store.logo_url || defaultStoreConfig.logo,
      favicon: store.favicon_url || defaultStoreConfig.favicon,
      heroBanner: store.hero_banner_url || defaultStoreConfig.heroBanner,
      primaryColor: store.primary_color || defaultStoreConfig.primaryColor,
      secondaryColor: store.secondary_color || defaultStoreConfig.secondaryColor,
      backgroundColor: store.background_color || defaultStoreConfig.backgroundColor,
      surfaceColor: store.surface_color || defaultStoreConfig.surfaceColor,
      textColor: store.text_color || defaultStoreConfig.textColor,
      mutedColor: store.muted_color || defaultStoreConfig.mutedColor,
      fontFamily: store.font_family || defaultStoreConfig.fontFamily,
      borderRadius: store.border_radius || defaultStoreConfig.borderRadius,
      defaultLocale: (store.default_language as 'km' | 'en') || defaultStoreConfig.defaultLocale,
      currency: (store.currency as 'USD' | 'KHR') || defaultStoreConfig.currency,
      contact: {
        phone: store.phone || defaultStoreConfig.contact.phone,
        email: store.email || defaultStoreConfig.contact.email,
        address: store.address || defaultStoreConfig.contact.address,
      },
      delivery: {
        fee: Number(store.delivery_fee ?? defaultStoreConfig.delivery.fee),
        freeFrom: Number(store.free_delivery_threshold ?? defaultStoreConfig.delivery.freeFrom),
        estimateKm: store.delivery_estimates?.km || defaultStoreConfig.delivery.estimateKm,
        estimateEn: store.delivery_estimates?.en || defaultStoreConfig.delivery.estimateEn,
        provinces: store.delivery_provinces || [...defaultStoreConfig.delivery.provinces],
      },
      checkoutDefaults: defaultStoreConfig.checkoutDefaults,
      promotion: store.voucher_settings || defaultStoreConfig.promotion,
      telegram: {
        botUsername: store.telegram_bot_username || defaultStoreConfig.telegram.botUsername,
        orderGroupId: store.order_group_id,
      },
      social: store.social_links || defaultStoreConfig.social,
      policies: store.return_policy ? [
        { titleKm: 'ការដឹកជញ្ជូន', titleEn: 'Delivery', textKm: store.delivery_policy?.km || '', textEn: store.delivery_policy?.en || '' },
        { titleKm: 'ការប្តូរទំនិញ', titleEn: 'Returns', textKm: store.return_policy?.km || '', textEn: store.return_policy?.en || '' },
        { titleKm: 'ការទូទាត់', titleEn: 'Payment', textKm: store.payment_policy?.km || '', textEn: store.payment_policy?.en || '' },
      ] : [...defaultStoreConfig.policies],
      paymentMethods: store.payment_methods || [...defaultStoreConfig.paymentMethods],
    }
  } catch {
    return defaultStoreConfig as unknown as StoreConfig
  }
}

export async function fetchCategories(storeId: string = ACTIVE_STORE_SLUG): Promise<CategoryItem[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return [
        { id: '1', slug: 'electronics', nameKm: 'អេឡិចត្រូនិក', nameEn: 'Electronics', icon: '📱' },
        { id: '2', slug: 'accessories', nameKm: 'គ្រឿងបន្លាស់', nameEn: 'Accessories', icon: '🎧' },
        { id: '3', slug: 'fashion', nameKm: 'សម្លៀកបំពាក់', nameEn: 'Fashion', icon: '👕' },
        { id: '4', slug: 'lifestyle', nameKm: 'រៀបចំការរស់នៅ', nameEn: 'Lifestyle', icon: '☕' },
      ]
    }

    return data.map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      nameKm: cat.name_km,
      nameEn: cat.name_en,
      icon: cat.icon || '📦',
      sortOrder: cat.sort_order,
    }))
  } catch {
    return []
  }
}

export async function fetchProducts(storeId: string = ACTIVE_STORE_SLUG): Promise<Product[]> {
  try {
    const { data: rawProducts, error } = await supabase
      .from('products')
      .select(`
        *,
        categories ( slug, name_en, name_km ),
        product_images ( url, sort_order )
      `)
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error || !rawProducts || rawProducts.length === 0) {
      return productSeeds as Product[]
    }

    return rawProducts.map((p) => {
      const images: string[] = p.product_images && p.product_images.length > 0
        ? p.product_images.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order).map((i: { url: string }) => i.url)
        : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800']

      const basePrice = Number(p.base_price)
      const discount = Number(p.discount_percent || 0)
      const price = discount > 0 ? Math.round(basePrice * (1 - discount / 100) * 100) / 100 : basePrice
      const oldPrice = discount > 0 ? basePrice : undefined

      return {
        id: p.id,
        legacyId: p.legacy_id,
        slug: p.slug,
        name: p.name_km || p.name_en,
        nameKm: p.name_km,
        nameEn: p.name_en,
        category: p.categories?.slug || 'electronics',
        categoryId: p.category_id,
        price,
        basePrice,
        discount,
        discountPercent: discount,
        oldPrice,
        rating: Number(p.rating || 5.0),
        stock: Number(p.stock || 0),
        soldCount: Number(p.sold_count || 0),
        isNew: p.is_new,
        isBestSeller: p.is_bestseller,
        image: images[0],
        images,
        description: p.description_km || p.description_en || '',
        descriptionKm: p.description_km,
        descriptionEn: p.description_en,
        colors: p.colors || [],
        sizes: p.sizes || [],
        deliveryEstimate: p.delivery_estimate_km || p.delivery_estimate_en || '1-3 ថ្ងៃ',
        deliveryEstimateKm: p.delivery_estimate_km,
        deliveryEstimateEn: p.delivery_estimate_en,
        createdAt: p.created_at || new Date().toISOString(),
      }
    })
  } catch {
    return productSeeds as Product[]
  }
}

export async function submitOrder(orderData: Partial<Order> & { storeId?: string }): Promise<Order | null> {
  const storeId = orderData.storeId || ACTIVE_STORE_SLUG

  try {
    const { data: insertedOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id: storeId,
        order_number: orderData.id,
        customer_name: orderData.customerName || 'Customer',
        customer_phone: orderData.customerPhone || 'N/A',
        customer_address: orderData.customerAddress || 'N/A',
        delivery_province: orderData.deliveryProvince || 'ភ្នំពេញ',
        delivery_fee: orderData.deliveryFee || 0,
        subtotal: orderData.subtotal || orderData.total || 0,
        discount: orderData.discount || 0,
        total: orderData.total || 0,
        currency: orderData.currency || 'USD',
        payment_method: orderData.paymentMethod || 'Cash on Delivery',
        status: 'Pending',
        payment_status: orderData.paymentStatus || 'Unpaid',
        delivery_status: 'Waiting for confirmation',
        notes: orderData.notes,
        telegram_user_id: orderData.telegramUserId,
      })
      .select()
      .single()

    if (orderError || !insertedOrder) {
      console.error('Failed to save order to Supabase:', orderError)
      return null
    }

    if (orderData.items && orderData.items.length > 0) {
      const itemsToInsert = orderData.items.map((item) => ({
        store_id: storeId,
        order_id: insertedOrder.id,
        product_id: typeof item.productId === 'string' && item.productId.length > 20 ? item.productId : null,
        product_name: item.product?.name || `Product #${item.productId}`,
        price: item.product?.price || 0,
        quantity: item.quantity,
        selected_color: item.color,
        selected_size: item.size || item.variant,
        total_price: (item.product?.price || 0) * item.quantity,
      }))

      await supabase.from('order_items').insert(itemsToInsert)
    }

    try {
      await fetch('/api/orders/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, orderId: insertedOrder.id }),
      })
    } catch {
      /* Silent fallback */
    }

    return {
      id: insertedOrder.order_number,
      storeId: insertedOrder.store_id,
      createdAt: insertedOrder.created_at,
      status: insertedOrder.status,
      total: Number(insertedOrder.total),
      subtotal: Number(insertedOrder.subtotal),
      discount: Number(insertedOrder.discount),
      deliveryFee: Number(insertedOrder.delivery_fee),
      currency: insertedOrder.currency,
      items: orderData.items || [],
      customerName: insertedOrder.customer_name,
      customerPhone: insertedOrder.customer_phone,
      customerAddress: insertedOrder.customer_address,
      deliveryProvince: insertedOrder.delivery_province,
      paymentMethod: insertedOrder.payment_method,
      paymentStatus: insertedOrder.payment_status,
      deliveryStatus: insertedOrder.delivery_status,
      notes: insertedOrder.notes,
      telegramUserId: insertedOrder.telegram_user_id,
    }
  } catch (err) {
    console.error('Order submission exception:', err)
    return null
  }
}
