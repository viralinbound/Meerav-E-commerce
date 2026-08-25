/**
 * In-memory Supabase stand-in: shared tables, isolated store/admin auth,
 * PostgREST-style query builder, Storage, and admin-manage Edge Function.
 */

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function randomId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function tempPassword() {
  return `Tmp-${Math.random().toString(36).slice(2, 10)}!`;
}

export function seedDatabase() {
  const now = '2026-01-15T10:00:00.000Z';
  return {
    categories: [
      { id: 'all', name: 'All Delicacies', icon: 'fas fa-border-all', description: 'Full catalog', sort_order: 0, created_at: now },
      { id: 'bhujia-sev', name: 'Bhujia & Sev', icon: 'fas fa-fire', description: 'Crispy sev', sort_order: 1, created_at: now }
    ],
    products: [
      {
        id: 'p1',
        name: 'Meerav Authentic Aloo Bhujia',
        category: 'bhujia-sev',
        tag: 'Best Seller',
        rating: 5,
        reviews_count: 684,
        spice_level: 'Mild',
        dietary: ['100% Veg'],
        image: 'assets/images/cinematic_bhujia.jpg',
        video: 'assets/videos/clip_bhujia.mp4',
        photos: ['assets/images/cinematic_bhujia.jpg'],
        videos: ['assets/videos/clip_bhujia.mp4'],
        sample_image: null,
        description: 'Potato bhujia',
        ingredients: 'Potato, oil',
        nutrition: { energy: '530 kcal', fat: '32g', carbs: '50g', protein: '10g' },
        in_stock: true,
        variants: [{ weight: '200 g', price: 99, originalPrice: 120 }],
        created_at: now
      }
    ],
    orders: [],
    customers: [],
    notifications: [],
    coupons: [
      { id: 'c1', code: 'MEERAV10', discount_type: 'percentage', discount_val: 10, min_order_amount: 299, description: '10% Off', is_active: true, created_at: now }
    ],
    testimonials: [
      { id: 't1', name: 'Pooja Sharma', city: 'Mumbai', rating: 5, review_text: 'Authentic taste!', avatar: 'assets/images/drive_1.jpg', is_visible: true, sort_order: 1, created_at: now }
    ],
    faqs: [
      { id: 'f1', question: 'Do you use palm oil?', answer: 'Never.', category: 'quality', sort_order: 1, is_visible: true, created_at: now }
    ],
    site_settings: [
      { id: 1, site_name: 'MEERAV NAMKEENS', primary_color: '#4A0713', updated_at: now }
    ],
    page_content: [
      { key: 'hero.title', value: 'Royal Taste', label: 'Hero Title', page: 'home', sort_order: 1, updated_at: now }
    ],
    admins: [
      {
        id: 'admin-root',
        name: 'Root Operator',
        email: 'root@meerav.com',
        role: 'root',
        banned: false,
        must_change_password: false,
        created_at: now
      },
      {
        id: 'admin-sub',
        name: 'Sub Operator',
        email: 'sub@meerav.com',
        role: 'admin',
        banned: false,
        must_change_password: true,
        created_at: now
      },
      {
        id: 'admin-banned',
        name: 'Banned Operator',
        email: 'banned@meerav.com',
        role: 'admin',
        banned: true,
        must_change_password: false,
        created_at: now
      }
    ],
    admin_warnings: [],
    admin_activity_log: [],
    authUsers: [
      { id: 'admin-root', email: 'root@meerav.com', password: 'root-secret-1', user_metadata: { name: 'Root Operator' }, confirmed: true },
      { id: 'admin-sub', email: 'sub@meerav.com', password: 'temp-sub-1', user_metadata: { name: 'Sub Operator' }, confirmed: true },
      { id: 'admin-banned', email: 'banned@meerav.com', password: 'banned-secret-1', user_metadata: { name: 'Banned Operator' }, confirmed: true },
      { id: 'cust-existing', email: 'pooja@example.com', password: 'snack123', user_metadata: { name: 'Pooja', phone: '+919820144521' }, confirmed: true }
    ],
    storageObjects: [],
    requireEmailConfirmation: false
  };
}

function adminProfileFor(db, user) {
  if (!user) return null;
  return db.admins.find((a) => a.id === user.id) || null;
}

function actorMeta(kind, sessionUser, db) {
  const profile = kind === 'admin' ? adminProfileFor(db, sessionUser) : null;
  const isAdmin = !!(profile && !profile.banned);
  return {
    kind,
    user: sessionUser,
    adminProfile: profile,
    isAdmin,
    isRoot: isAdmin && profile.role === 'root'
  };
}

function deny(message) {
  return { data: null, error: { message, code: '42501' } };
}

function applyFilters(rows, filters) {
  return rows.filter((row) => filters.every(({ key, value }) => String(row[key]) === String(value)));
}

function authorize(actor, table, op, row) {
  if (table === 'categories' || table === 'products' || table === 'coupons' || table === 'testimonials' || table === 'faqs' || table === 'site_settings' || table === 'page_content') {
    if (op === 'select') return true;
    return actor.isAdmin;
  }
  if (table === 'orders') {
    if (op === 'select' || op === 'insert') return true;
    return actor.isAdmin;
  }
  if (table === 'customers') {
    if (op === 'insert' || op === 'upsert') return true;
    if (op === 'select') {
      if (actor.isAdmin) return true;
      return !!(actor.user && row && row.id === actor.user.id);
    }
    if (op === 'update') {
      if (actor.isAdmin) return true;
      return !!(actor.user && row && row.id === actor.user.id);
    }
    return false;
  }
  if (table === 'notifications') {
    if (op === 'insert') return true;
    return actor.isAdmin;
  }
  if (table === 'admins') {
    if (op === 'select') {
      // Own row is readable even when banned so sign-in can return the banned error.
      if (actor.user && row && row.id === actor.user.id) return true;
      return actor.isAdmin;
    }
    return false;
  }
  if (table === 'admin_warnings') {
    if (op === 'select') {
      if (actor.isRoot) return true;
      return !!(actor.user && row && row.admin_id === actor.user.id);
    }
    if (op === 'update') return !!(actor.user && row && row.admin_id === actor.user.id);
    if (op === 'insert') return actor.isRoot;
    return false;
  }
  if (table === 'admin_activity_log') {
    if (op === 'insert') return actor.isAdmin;
    return actor.isRoot;
  }
  return false;
}

class Query {
  constructor(db, table, getActor) {
    this.db = db;
    this.table = table;
    this.getActor = getActor;
    this.filters = [];
    this.orderBy = null;
    this.limitTo = null;
    this.single = false;
    this.op = 'select';
    this.payload = null;
  }

  select() { return this; }
  eq(key, value) { this.filters.push({ key, value }); return this; }
  order(column, opts = {}) {
    this.orderBy = { column, ascending: opts.ascending !== false };
    return this;
  }
  limit(n) { this.limitTo = n; return this; }
  maybeSingle() { this.single = true; return this; }

  insert(row) { this.op = 'insert'; this.payload = row; return this; }
  upsert(row, opts = {}) { this.op = 'upsert'; this.payload = row; this.conflictKey = opts.onConflict || 'id'; return this; }
  update(patch) { this.op = 'update'; this.payload = patch; return this; }
  delete() { this.op = 'delete'; return this; }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  async execute() {
    const actor = this.getActor();
    const tableRows = this.db[this.table];
    if (!tableRows) return deny(`Unknown table ${this.table}`);

    if (this.orderBy && this.orderBy.column === 'sort_order' && this.db.__failSortOrder) {
      return { data: null, error: { message: 'column categories.sort_order does not exist', code: '42703' } };
    }

    if (this.op === 'select') {
      let rows = applyFilters(tableRows, this.filters).filter((row) => authorize(actor, this.table, 'select', row));
      if (this.orderBy) {
        const { column, ascending } = this.orderBy;
        if (rows.length && !(column in rows[0]) && column === 'sort_order') {
          return { data: null, error: { message: 'column categories.sort_order does not exist', code: '42703' } };
        }
        rows = [...rows].sort((a, b) => {
          if (a[column] < b[column]) return ascending ? -1 : 1;
          if (a[column] > b[column]) return ascending ? 1 : -1;
          return 0;
        });
      }
      if (this.limitTo != null) rows = rows.slice(0, this.limitTo);
      const data = clone(rows);
      if (this.single) return { data: data[0] || null, error: null };
      return { data, error: null };
    }

    if (this.op === 'insert') {
      const row = { ...this.payload };
      if (!authorize(actor, this.table, 'insert', row)) return deny('permission denied for insert');
      if (row.id && tableRows.some((r) => r.id === row.id)) {
        return { data: null, error: { message: 'duplicate key value violates unique constraint', code: '23505' } };
      }
      if (!row.id) row.id = randomId(this.table.slice(0, 3));
      if (!row.created_at) row.created_at = new Date().toISOString();
      tableRows.push(row);
      return { data: clone(row), error: null };
    }

    if (this.op === 'upsert') {
      // Real supabase-js accepts either a single row object or an array of
      // rows (bulk upsert) — mirror both so mocked calls behave like production.
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
      const conflictKey = this.conflictKey || 'id';
      const results = [];
      for (const incoming of rows) {
        const row = { ...incoming };
        if (!authorize(actor, this.table, 'upsert', row)) return deny('permission denied for upsert');
        const idx = tableRows.findIndex((r) => r[conflictKey] === row[conflictKey]);
        if (idx === -1) {
          if (!row.created_at) row.created_at = new Date().toISOString();
          tableRows.push(row);
        } else {
          tableRows[idx] = { ...tableRows[idx], ...row };
        }
        results.push(row);
      }
      return { data: Array.isArray(this.payload) ? clone(results) : clone(results[0]), error: null };
    }

    if (this.op === 'update') {
      const matches = applyFilters(tableRows, this.filters);
      if (!matches.length) return { data: [], error: null };
      for (const match of matches) {
        if (!authorize(actor, this.table, 'update', match)) return deny('permission denied for update');
        Object.assign(match, this.payload);
      }
      return { data: clone(matches), error: null };
    }

    if (this.op === 'delete') {
      const matches = applyFilters(tableRows, this.filters);
      for (const match of matches) {
        if (!authorize(actor, this.table, 'delete', match)) return deny('permission denied for delete');
      }
      for (const match of matches) {
        const idx = tableRows.findIndex((r) => r === match);
        if (idx !== -1) tableRows.splice(idx, 1);
      }
      return { data: clone(matches), error: null };
    }

    return deny('unknown operation');
  }
}

function createAuth(db, sessionRef) {
  const listeners = [];

  function emit(event, session) {
    listeners.forEach((cb) => cb(event, session));
  }

  function sessionFor(user) {
    if (!user) return null;
    return { access_token: `tok-${user.id}`, user: { id: user.id, email: user.email, user_metadata: user.user_metadata || {} } };
  }

  return {
    async signUp({ email, password, options }) {
      if (!email || !password) return { data: { user: null, session: null }, error: { message: 'Email and password required' } };
      if (password.length < 6) return { data: { user: null, session: null }, error: { message: 'Password should be at least 6 characters' } };
      if (db.authUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { data: { user: null, session: null }, error: { message: 'User already registered' } };
      }
      const user = {
        id: randomId('usr'),
        email,
        password,
        user_metadata: (options && options.data) || {},
        confirmed: !db.requireEmailConfirmation
      };
      db.authUsers.push(user);
      const session = user.confirmed ? sessionFor(user) : null;
      if (session) {
        sessionRef.user = user;
        emit('SIGNED_IN', session);
      }
      return { data: { user: { id: user.id, email: user.email, user_metadata: user.user_metadata }, session }, error: null };
    },

    async signInWithPassword({ email, password }) {
      const user = db.authUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!user) return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
      if (!user.confirmed) return { data: { user: null, session: null }, error: { message: 'Email not confirmed' } };
      sessionRef.user = user;
      const session = sessionFor(user);
      emit('SIGNED_IN', session);
      return { data: { user: session.user, session }, error: null };
    },

    async signOut() {
      sessionRef.user = null;
      emit('SIGNED_OUT', null);
      return { error: null };
    },

    async getSession() {
      return { data: { session: sessionFor(sessionRef.user) } };
    },

    async getUser() {
      const user = sessionRef.user;
      return { data: { user: user ? { id: user.id, email: user.email, user_metadata: user.user_metadata || {} } : null } };
    },

    onAuthStateChange(callback) {
      listeners.push(callback);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };
}

async function handleAdminManage(db, actor, body) {
  const fail = (message) => ({ data: null, error: { message, context: { json: async () => ({ error: message }) } } });

  if (!actor.user) return fail('Not authenticated');
  if (!actor.isAdmin) return fail('Not an admin');

  const { action } = body || {};

  if (action === 'change_password') {
    if (!body.newPassword || body.newPassword.length < 8) return fail('Password must be at least 8 characters');
    const authUser = db.authUsers.find((u) => u.id === actor.user.id);
    authUser.password = body.newPassword;
    const admin = db.admins.find((a) => a.id === actor.user.id);
    if (admin) admin.must_change_password = false;
    return { data: { ok: true }, error: null };
  }

  if (!actor.isRoot) return fail('Only the root admin can perform this action');

  if (action === 'register') {
    const { email, name } = body;
    if (!email || !name) return fail('Email and name are required');
    if (db.authUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return fail('User already registered');
    }
    const password = tempPassword();
    const id = randomId('admin');
    db.authUsers.push({ id, email, password, user_metadata: { name }, confirmed: true });
    db.admins.push({
      id, name, email, role: 'admin', banned: false, must_change_password: true,
      created_at: new Date().toISOString()
    });
    return { data: { tempPassword: password, id }, error: null };
  }

  const target = db.admins.find((a) => a.id === body.adminId);
  if (!target) return fail('Admin not found');
  if (target.role === 'root') return fail('Cannot modify the root admin');

  if (action === 'reset_password') {
    const password = tempPassword();
    const authUser = db.authUsers.find((u) => u.id === target.id);
    authUser.password = password;
    target.must_change_password = true;
    return { data: { tempPassword: password }, error: null };
  }

  if (action === 'ban') {
    target.banned = true;
    return { data: { ok: true }, error: null };
  }

  if (action === 'unban') {
    target.banned = false;
    return { data: { ok: true }, error: null };
  }

  if (action === 'warn') {
    if (!body.message) return fail('Message is required');
    db.admin_warnings.push({
      id: randomId('warn'),
      admin_id: target.id,
      issued_by_name: actor.adminProfile.name,
      message: body.message,
      acknowledged: false,
      created_at: new Date().toISOString()
    });
    return { data: { ok: true }, error: null };
  }

  if (action === 'remove') {
    db.admins = db.admins.filter((a) => a.id !== target.id);
    db.authUsers = db.authUsers.filter((u) => u.id !== target.id);
    return { data: { ok: true }, error: null };
  }

  return fail(`Unknown action ${action}`);
}

function createClient(db, kind) {
  const sessionRef = { user: null };
  const auth = createAuth(db, sessionRef);
  const getActor = () => actorMeta(kind, sessionRef.user, db);

  return {
    kind,
    auth,
    from(table) {
      return new Query(db, table, getActor);
    },
    storage: {
      from(bucket) {
        return {
          async upload(path, file, options) {
            if (db.storageObjects.some((o) => o.path === path) && options && options.upsert === false) {
              return { error: { message: 'Duplicate object' } };
            }
            db.storageObjects.push({ bucket, path, contentType: options && options.contentType, name: file && file.name });
            return { error: null };
          },
          getPublicUrl(path) {
            return { data: { publicUrl: `https://mock.supabase.local/storage/v1/object/public/${bucket}/${path}` } };
          }
        };
      }
    },
    functions: {
      async invoke(name, { body }) {
        if (name !== 'admin-manage') {
          return { data: null, error: { message: `Unknown function ${name}` } };
        }
        return handleAdminManage(db, getActor(), body);
      }
    },
    channel() {
      return {
        on() { return this; },
        subscribe() { return { status: 'SUBSCRIBED' }; }
      };
    }
  };
}

export function createMockSupabase(overrides = {}) {
  const db = { ...seedDatabase(), ...overrides };
  if (overrides.categories) db.categories = overrides.categories;
  const storeClient = createClient(db, 'store');
  const adminClient = createClient(db, 'admin');
  return { db, storeClient, adminClient };
}
