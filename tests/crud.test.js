import { describe, it, expect, beforeEach } from 'vitest';
import { createMiraDB } from '../backend/mira-db.js';
import {
  dbProductToApp, appProductToDb,
  dbCustomerToApp, appCustomerToDb,
  dbOrderToApp, appOrderToDb,
  dbCategoryToApp, dbNotifToApp
} from '../backend/mappers.js';
import { createMockSupabase } from './helpers/mock-supabase.js';

function createApi(overrides) {
  const mock = createMockSupabase(overrides);
  const api = createMiraDB({ supabaseClient: mock.storeClient, adminSupabaseClient: mock.adminClient });
  return { ...mock, api };
}

const sampleProduct = {
  id: 'p-new',
  name: 'Hing Sev',
  category: 'bhujia-sev',
  tag: 'Signature',
  rating: 4.9,
  reviewsCount: 10,
  spiceLevel: 'Medium',
  dietary: ['100% Veg'],
  photos: ['https://cdn.example/hing.jpg'],
  videos: [],
  description: 'Crispy hing sev',
  ingredients: 'Besan, hing',
  nutrition: { energy: '520 kcal' },
  inStock: true,
  variants: [{ weight: '200 g', price: 119, originalPrice: 139 }]
};

const sampleOrder = {
  id: 'MEERAV-4401',
  customer: { name: 'Pooja', phone: '+919820144521', email: 'pooja@example.com', address: 'Bandra', pincode: '400050', lat: 19.05, lng: 72.82 },
  items: [{ name: 'Aloo Bhujia (200 g)', qty: 2, price: 99 }],
  totalAmount: 248,
  paymentMethod: 'UPI (QR Auto-Verified)',
  paymentStatus: 'Paid',
  orderStatus: 'Dispatched',
  date: '22 Aug 2026, 5:00 pm',
  trackingNumber: 'DTDC-12345678',
  driver: { name: 'Ramesh' },
  notifications: { whatsappSent: true, emailSent: false }
};

describe('Mappers (row <-> app)', () => {
  it('round-trips a product including photos cover', () => {
    const db = appProductToDb(sampleProduct);
    expect(db.image).toBe(sampleProduct.photos[0]);
    expect(db.in_stock).toBe(true);
    const app = dbProductToApp(db);
    expect(app.image).toBe(sampleProduct.photos[0]);
    expect(app.inStock).toBe(true);
    expect(app.reviewsCount).toBe(10);
  });

  it('falls back to image/video when photos/videos are empty', () => {
    const app = dbProductToApp({
      id: 'p1', image: 'pack.png', video: 'clip.mp4', reviews_count: 1, rating: '4.5', in_stock: false
    });
    expect(app.photos).toEqual(['pack.png']);
    expect(app.videos).toEqual(['clip.mp4']);
    expect(app.rating).toBe(4.5);
    expect(app.inStock).toBe(false);
  });

  it('maps customers, orders, categories, and notifications', () => {
    expect(dbCategoryToApp({ id: 'mathri', name: 'Mathri', icon: 'fas fa-sun', description: 'd' }).id).toBe('mathri');
    const customer = dbCustomerToApp({ id: 'u1', name: 'A', phone: '1', saved_addresses: [{ label: 'Home' }] });
    expect(customer.savedAddresses[0].label).toBe('Home');
    expect(appCustomerToDb(customer).saved_addresses[0].label).toBe('Home');

    const order = dbOrderToApp(appOrderToDb(sampleOrder));
    expect(order.totalAmount).toBe(248);
    expect(order.orderStatus).toBe('Dispatched');

    expect(dbNotifToApp({ id: 'n1', notif_time: 'Just now', status_color: 'green' }).time).toBe('Just now');
  });
});

describe('Core CRUD — catalog (test matrix F2 / F17 / F18)', () => {
  let api;

  beforeEach(() => {
    ({ api } = createApi());
  });

  it('F2-HP-01 public read of categories and products', async () => {
    const cats = await api.fetchCategories();
    expect(cats.map((c) => c.id)).toContain('bhujia-sev');
    const products = await api.fetchProducts();
    expect(products[0].id).toBe('p1');
    expect(products[0].inStock).toBe(true);
    expect(products[0].image).toBeTruthy();
  });

  it('F1-EC-03 falls back when sort_order is missing', async () => {
    const { api: fallbackApi } = createApi({ __failSortOrder: true });
    const cats = await fallbackApi.fetchCategories();
    expect(cats.length).toBeGreaterThan(0);
  });

  it('F17-AU-01 guest cannot mutate products; admin can', async () => {
    expect(await api.dbUpsertProduct(sampleProduct)).toBe(false);
    expect(await api.dbDeleteProduct('p1')).toBe(false);

    await api.signInAdmin('sub@meerav.com', 'temp-sub-1');
    expect(await api.dbUpsertProduct(sampleProduct, api.adminClient)).toBe(true);
    const listed = await api.fetchProducts();
    expect(listed.some((p) => p.id === 'p-new' && p.name === 'Hing Sev')).toBe(true);

    expect(await api.dbDeleteProduct('p-new', api.adminClient)).toBe(true);
    expect((await api.fetchProducts()).some((p) => p.id === 'p-new')).toBe(false);
  });

  it('F17-HP-06 admin can toggle stock via upsert', async () => {
    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    const [product] = await api.fetchProducts();
    product.inStock = false;
    expect(await api.dbUpsertProduct(product, api.adminClient)).toBe(true);
    expect((await api.fetchProducts())[0].inStock).toBe(false);
  });

  it('F18 category create/update/delete requires admin and SET NULL is not applied in mock delete', async () => {
    expect(await api.dbUpsertCategory({ id: 'papad', name: 'Papad', icon: 'fas fa-sun', description: 'Crisps' })).toBe(false);

    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    expect(await api.dbUpsertCategory({ id: 'papad', name: 'Papad', icon: 'fas fa-sun', description: 'Crisps' }, api.adminClient)).toBe(true);
    expect((await api.fetchCategories()).some((c) => c.id === 'papad')).toBe(true);

    expect(await api.dbDeleteCategory('papad', api.adminClient)).toBe(true);
    expect((await api.fetchCategories()).some((c) => c.id === 'papad')).toBe(false);
  });
});

describe('Core CRUD — orders & customers (test matrix F10 / F16 / F19)', () => {
  let api;

  beforeEach(() => {
    ({ api } = createApi());
  });

  it('F10-HP-01 / F10-AU-01 guest can insert an order', async () => {
    expect(await api.dbInsertOrder(sampleOrder)).toBe(true);
    const orders = await api.fetchOrders();
    expect(orders[0].id).toBe('MEERAV-4401');
    expect(orders[0].totalAmount).toBe(248);
    expect(orders[0].paymentStatus).toBe('Paid');
  });

  it('F10-EC-02 duplicate order id fails', async () => {
    expect(await api.dbInsertOrder(sampleOrder)).toBe(true);
    expect(await api.dbInsertOrder(sampleOrder)).toBe(false);
  });

  it('F16-AU-01 guest cannot update order status; admin can', async () => {
    await api.dbInsertOrder(sampleOrder);
    expect(await api.dbUpdateOrderStatus('MEERAV-4401', 'Delivered')).toBe(false);

    await api.signInAdmin('sub@meerav.com', 'temp-sub-1');
    expect(await api.dbUpdateOrderStatus('MEERAV-4401', 'Delivered', api.adminClient)).toBe(true);
    expect((await api.fetchOrders())[0].orderStatus).toBe('Delivered');
  });

  it('F10-EC-03 guest checkout upserts a customer without Auth', async () => {
    const guest = {
      id: 'usr-guest-1',
      name: 'Walk-in',
      phone: '9000000000',
      email: 'walkin@example.com',
      address: 'Koregaon Park',
      pincode: '411001'
    };
    expect(await api.dbUpsertCustomer(guest)).toBe(true);
    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    const customers = await api.fetchCustomers(api.adminClient);
    expect(customers.some((c) => c.id === 'usr-guest-1')).toBe(true);
  });

  it('F19-AU-01 storefront cannot list all customers; admin can', async () => {
    await api.dbUpsertCustomer({ id: 'c1', name: 'A', phone: '1', email: 'a@x.com' });
    await api.dbUpsertCustomer({ id: 'c2', name: 'B', phone: '2', email: 'b@x.com' });
    expect(await api.fetchCustomers()).toEqual([]);

    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    expect((await api.fetchCustomers(api.adminClient)).length).toBeGreaterThanOrEqual(2);
  });

  it('signed-in customer can read only their own profile row', async () => {
    await api.signUpCustomer({
      email: 'onlyme@example.com',
      password: 'secret1',
      name: 'Only Me',
      phone: '111',
      address: 'x',
      pincode: '1'
    });
    const listed = await api.fetchCustomers();
    expect(listed).toHaveLength(1);
    expect(listed[0].email).toBe('onlyme@example.com');
  });
});

describe('Core CRUD — notifications & storage', () => {
  let api;

  beforeEach(() => {
    ({ api } = createApi());
  });

  it('storefront can insert a notification; only admin can list them', async () => {
    expect(await api.dbInsertNotification({
      id: 'NOTIF-101',
      type: 'WhatsApp',
      recipient: '90000 (Pooja)',
      template: 'New Order Placed #MEERAV-4401',
      time: 'Just now',
      status: 'Delivered & Read',
      statusColor: 'green'
    })).toBe(true);

    expect(await api.fetchNotifications()).toEqual([]);
    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    const rows = await api.fetchNotifications(api.adminClient);
    expect(rows[0].template).toMatch(/MEERAV-4401/);
  });

  it('F20-VA-01 equivalent: activity log insert requires an admin actor', async () => {
    expect(await api.logAdminActivity(null, 'product.update', 'p1')).toBe(false);
    expect(await api.logAdminActivity({ id: 'x', name: 'x', role: 'admin' }, 'product.update', 'p1')).toBe(false);

    await api.signInAdmin('sub@meerav.com', 'temp-sub-1');
    expect(await api.logAdminActivity({ id: 'admin-sub', name: 'Sub', role: 'admin' }, 'notification.broadcast', '90000')).toBe(true);
  });

  it('F22-HP-01 uploadMedia returns a public URL; F22-EC-02 null file returns null', async () => {
    expect(await api.uploadMedia(null, 'avatars')).toBeNull();
    const url = await api.uploadMedia({ name: 'me.png', type: 'image/png' }, 'avatars');
    expect(url).toMatch(/\/avatars\/.+\.png$/);
  });

  it('F21 undo helpers: mark activity undone (root)', async () => {
    await api.signInAdmin('sub@meerav.com', 'temp-sub-1');
    await api.logAdminActivity({ id: 'admin-sub', name: 'Sub', role: 'admin' }, 'product.update', 'Hing Sev', { productId: 'p-new' });
    await api.signOutAdmin();

    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    const entries = await api.fetchActivityForAdmin('admin-sub');
    expect(entries[0].undone).toBeFalsy();
    expect(await api.markActivityUndone(entries[0].id)).toBe(true);
    expect((await api.fetchActivityForAdmin('admin-sub'))[0].undone).toBe(true);
  });
});

describe('100% Brand Customization & CMS Suite (Coupons, Testimonials, FAQs, Settings, Page Content)', () => {
  let api;

  beforeEach(() => {
    ({ api } = createApi());
  });

  it('public read and admin CRUD for coupons', async () => {
    const publicCoupons = await api.fetchCoupons();
    expect(publicCoupons.length).toBeGreaterThanOrEqual(1);
    expect(publicCoupons[0].code).toBe('MEERAV10');

    // Guest cannot mutate
    expect(await api.dbUpsertCoupon({ id: 'c2', code: 'FESTIVE20', discountType: 'percentage', discountVal: 20, isActive: true })).toBe(false);

    // Admin can mutate
    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    expect(await api.dbUpsertCoupon({ id: 'c2', code: 'FESTIVE20', discountType: 'percentage', discountVal: 20, isActive: true }, api.adminClient)).toBe(true);
    
    const afterUpsert = await api.fetchCoupons();
    expect(afterUpsert.some(c => c.code === 'FESTIVE20')).toBe(true);

    expect(await api.dbDeleteCoupon('c2', api.adminClient)).toBe(true);
    const afterDelete = await api.fetchCoupons();
    expect(afterDelete.some(c => c.code === 'FESTIVE20')).toBe(false);
  });

  it('public read and admin CRUD for testimonials/reviews', async () => {
    const reviews = await api.fetchTestimonials();
    expect(reviews.length).toBeGreaterThanOrEqual(1);
    expect(reviews[0].name).toBe('Pooja Sharma');

    // Guest cannot mutate
    expect(await api.dbUpsertTestimonial({ id: 't2', name: 'Rohan', rating: 5, reviewText: 'Super crispy!', isVisible: true })).toBe(false);

    // Admin can mutate
    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    expect(await api.dbUpsertTestimonial({ id: 't2', name: 'Rohan', rating: 5, reviewText: 'Super crispy!', isVisible: true }, api.adminClient)).toBe(true);
    
    const afterUpsert = await api.fetchTestimonials();
    expect(afterUpsert.some(t => t.name === 'Rohan')).toBe(true);

    expect(await api.dbDeleteTestimonial('t2', api.adminClient)).toBe(true);
  });

  it('public read and admin CRUD for FAQs', async () => {
    const faqs = await api.fetchFaqs();
    expect(faqs.length).toBeGreaterThanOrEqual(1);
    expect(faqs[0].question).toContain('palm oil');

    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    expect(await api.dbUpsertFaq({ id: 'f2', question: 'How long is shelf life?', answer: '6 months', category: 'quality', sortOrder: 2, isVisible: true }, api.adminClient)).toBe(true);
    
    const afterUpsert = await api.fetchFaqs();
    expect(afterUpsert.some(f => f.id === 'f2')).toBe(true);

    expect(await api.dbDeleteFaq('f2', api.adminClient)).toBe(true);
  });

  it('admin can upsert site settings with full brand kit customization', async () => {
    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    const settings = {
      id: 1,
      siteName: 'SHAHI SWEETS & NAMKEEN',
      tagline: 'Imperial Flavours of Rajasthan',
      primaryColor: '#0F172A',
      secondaryColor: '#020617',
      accentColor: '#38BDF8',
      borderRadius: 'rounded-none',
      currencySymbol: '$',
      currencyCode: 'USD',
      heroVideoUrl: 'https://example.com/shahi.mp4',
      freeShippingThreshold: 50,
      shippingFlatFee: 5
    };

    expect(await api.dbUpsertSiteSettings(settings, api.adminClient)).toBe(true);
    const fetched = await api.fetchSiteSettings();
    expect(fetched.siteName).toBe('SHAHI SWEETS & NAMKEEN');
  });

  it('admin can upsert page content CMS rows', async () => {
    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    const contentEntries = [
      { key: 'hero.title', value: '100% Pure Ghee Goodness', label: 'Hero Title', page: 'home', sortOrder: 1 },
      { key: 'hero.badge', value: 'Royal Confectionery', label: 'Hero Badge', page: 'home', sortOrder: 2 }
    ];

    expect(await api.dbUpsertPageContent(contentEntries, api.adminClient)).toBe(true);
    const fetched = await api.fetchPageContent();
    expect(fetched.map['hero.title']).toBe('100% Pure Ghee Goodness');
  });
});
