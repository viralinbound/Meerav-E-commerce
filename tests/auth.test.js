import { describe, it, expect, beforeEach } from 'vitest';
import { createMiraDB } from '../backend/mira-db.js';
import { createMockSupabase } from './helpers/mock-supabase.js';

function createApi(overrides) {
  const mock = createMockSupabase(overrides);
  const api = createMiraDB({ supabaseClient: mock.storeClient, adminSupabaseClient: mock.adminClient });
  return { ...mock, api };
}

describe('Auth — customer (test matrix F12)', () => {
  let api;

  beforeEach(() => {
    ({ api } = createApi());
  });

  it('F12-HP-01 signs up and creates a customers row keyed by auth user id', async () => {
    const result = await api.signUpCustomer({
      email: 'raj@example.com',
      password: 'secret1',
      name: 'Rajesh Kothari',
      phone: '+919876500000',
      address: 'Bandra West',
      pincode: '400050'
    });

    expect(result.error).toBeUndefined();
    expect(result.needsConfirmation).toBe(false);
    expect(result.session).toBeTruthy();
    expect(result.profile.name).toBe('Rajesh Kothari');
    expect(result.profile.id).toBe(result.user.id);

    const mine = await api.getOrCreateCustomerProfile(result.user);
    expect(mine.phone).toBe('+919876500000');
    expect(mine.pincode).toBe('400050');
  });

  it('F12-HP-02 returns needsConfirmation when email confirmation is on', async () => {
    const { api: pendingApi } = createApi({ requireEmailConfirmation: true });
    const result = await pendingApi.signUpCustomer({
      email: 'new@example.com',
      password: 'secret1',
      name: 'New User',
      phone: '99999',
      address: 'Jaipur',
      pincode: '302001'
    });

    expect(result.error).toBeUndefined();
    expect(result.session).toBeNull();
    expect(result.needsConfirmation).toBe(true);
    expect(await pendingApi.getCurrentSession()).toBeNull();
  });

  it('F12-HP-03 / F12-HP-04 signs in and restores the session', async () => {
    const result = await api.signInCustomer('pooja@example.com', 'snack123');
    expect(result.error).toBeUndefined();
    expect(result.profile.email).toBe('pooja@example.com');
    expect(result.profile.name).toBe('Pooja');

    const session = await api.getCurrentSession();
    expect(session.user.email).toBe('pooja@example.com');
  });

  it('F12-HP-05 signs the customer out', async () => {
    await api.signInCustomer('pooja@example.com', 'snack123');
    await api.signOutCustomer();
    expect(await api.getCurrentSession()).toBeNull();
  });

  it('F12-EC-01 rejects duplicate email', async () => {
    const result = await api.signUpCustomer({
      email: 'pooja@example.com',
      password: 'secret1',
      name: 'Clone',
      phone: '1',
      address: 'x',
      pincode: '1'
    });
    expect(result.error.message).toMatch(/already registered/i);
  });

  it('F12-EC-02 rejects invalid password', async () => {
    const result = await api.signInCustomer('pooja@example.com', 'wrong');
    expect(result.error.message).toMatch(/invalid/i);
  });

  it('F12-VA-02 rejects passwords shorter than 6 characters', async () => {
    const result = await api.signUpCustomer({
      email: 'short@example.com',
      password: '12345',
      name: 'Short',
      phone: '1',
      address: 'x',
      pincode: '1'
    });
    expect(result.error.message).toMatch(/at least 6/i);
  });

  it('F12-EC-04 creates a profile if the auth user has no customers row', async () => {
    const result = await api.signInCustomer('pooja@example.com', 'snack123');
    expect(result.profile.id).toBe('cust-existing');
    expect(result.profile.email).toBe('pooja@example.com');
  });

  it('does not leak the customer session onto the admin client', async () => {
    await api.signInCustomer('pooja@example.com', 'snack123');
    expect(await api.getAdminSession()).toBeNull();
    expect(await api.getCurrentAdminProfile()).toBeNull();
  });
});

describe('Auth — admin (test matrix F15 / F21)', () => {
  let api;

  beforeEach(() => {
    ({ api } = createApi());
  });

  it('F15-HP-01 signs in a root admin', async () => {
    const result = await api.signInAdmin('root@meerav.com', 'root-secret-1');
    expect(result.error).toBeUndefined();
    expect(result.profile.role).toBe('root');
    expect(result.profile.banned).toBe(false);
  });

  it('F15-HP-03 surfaces must_change_password for sub-admins', async () => {
    const result = await api.signInAdmin('sub@meerav.com', 'temp-sub-1');
    expect(result.error).toBeUndefined();
    expect(result.profile.must_change_password).toBe(true);
  });

  it('F15-HP-04 change_password requires 8+ chars and clears the flag', async () => {
    await api.signInAdmin('sub@meerav.com', 'temp-sub-1');
    const tooShort = await api.changeOwnPassword('short');
    expect(tooShort.error.message).toMatch(/8 characters/i);

    const ok = await api.changeOwnPassword('newpass99');
    expect(ok.error).toBeUndefined();
    expect(ok.ok).toBe(true);

    await api.signOutAdmin();
    const again = await api.signInAdmin('sub@meerav.com', 'newpass99');
    expect(again.error).toBeUndefined();
    expect(again.profile.must_change_password).toBe(false);
  });

  it('F15-EC-01 rejects a customer account on the admin portal', async () => {
    await api.signUpCustomer({
      email: 'foodie@example.com',
      password: 'secret1',
      name: 'Foodie',
      phone: '1',
      address: 'x',
      pincode: '1'
    });
    const result = await api.signInAdmin('foodie@example.com', 'secret1');
    expect(result.error.message).toMatch(/not registered as an admin/i);
    expect(await api.getAdminSession()).toBeNull();
  });

  it('F15-EC-02 rejects banned admins and signs them out', async () => {
    const result = await api.signInAdmin('banned@meerav.com', 'banned-secret-1');
    expect(result.error.message).toMatch(/banned/i);
    expect(await api.getAdminSession()).toBeNull();
  });

  it('F15-EC-03 rejects wrong admin password', async () => {
    const result = await api.signInAdmin('root@meerav.com', 'nope');
    expect(result.error.message).toMatch(/invalid/i);
  });

  it('F21-HP-01 root can register a sub-admin with a one-time password', async () => {
    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    const created = await api.registerAdmin({ email: 'ops@meerav.com', name: 'Ops' });
    expect(created.error).toBeUndefined();
    expect(created.tempPassword).toBeTruthy();

    await api.signOutAdmin();
    const firstLogin = await api.signInAdmin('ops@meerav.com', created.tempPassword);
    expect(firstLogin.error).toBeUndefined();
    expect(firstLogin.profile.must_change_password).toBe(true);
    expect(firstLogin.profile.role).toBe('admin');
  });

  it('F21-AU-01 sub-admin cannot register another admin', async () => {
    await api.signInAdmin('sub@meerav.com', 'temp-sub-1');
    const result = await api.registerAdmin({ email: 'x@meerav.com', name: 'X' });
    expect(result.error.message).toMatch(/root admin/i);
  });

  it('F21-HP-04 / F21-EC-02 ban/unban sub-admin but never the root', async () => {
    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    const bannedRoot = await api.banAdmin('admin-root');
    expect(bannedRoot.error.message).toMatch(/root admin/i);

    const banned = await api.banAdmin('admin-sub');
    expect(banned.error).toBeUndefined();

    await api.signOutAdmin();
    const blocked = await api.signInAdmin('sub@meerav.com', 'temp-sub-1');
    expect(blocked.error.message).toMatch(/banned/i);

    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    await api.unbanAdmin('admin-sub');
    await api.signOutAdmin();
    const restored = await api.signInAdmin('sub@meerav.com', 'temp-sub-1');
    expect(restored.error).toBeUndefined();
  });

  it('F21-HP-05 / F21-HP-06 warn and acknowledge', async () => {
    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    const empty = await api.warnAdmin('admin-sub', '');
    expect(empty.error).toBeTruthy();

    await api.warnAdmin('admin-sub', 'Do not delete the catalog');
    await api.signOutAdmin();

    await api.signInAdmin('sub@meerav.com', 'temp-sub-1');
    const mine = await api.fetchMyWarnings();
    expect(mine).toHaveLength(1);
    expect(mine[0].message).toMatch(/catalog/);

    expect(await api.acknowledgeWarning(mine[0].id)).toBe(true);
    expect(await api.fetchMyWarnings()).toHaveLength(0);
  });

  it('F21-HP-07 remove deletes login; F21-EC-02 cannot remove root', async () => {
    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    expect((await api.removeAdmin('admin-root')).error.message).toMatch(/root admin/i);

    const removed = await api.removeAdmin('admin-sub');
    expect(removed.error).toBeUndefined();
    await api.signOutAdmin();
    const gone = await api.signInAdmin('sub@meerav.com', 'temp-sub-1');
    expect(gone.error).toBeTruthy();
  });

  it('F21-AU-02 activity log is root-only', async () => {
    await api.signInAdmin('sub@meerav.com', 'temp-sub-1');
    expect(await api.logAdminActivity({ id: 'admin-sub', name: 'Sub', role: 'admin' }, 'product.update', 'p1')).toBe(true);
    expect(await api.fetchActivityLog()).toEqual([]);

    await api.signOutAdmin();
    await api.signInAdmin('root@meerav.com', 'root-secret-1');
    const log = await api.fetchActivityLog();
    expect(log.some((e) => e.action === 'product.update')).toBe(true);
  });
});
