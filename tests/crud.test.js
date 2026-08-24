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
