import { apiFetch, getStoredToken, setStoredToken } from './api.js';

const listeners = new Set();

function notifyAuthChange(event, session) {
  listeners.forEach((callback) => callback(event, session));
}

function buildSession(token, user) {
  if (!token || !user) return null;
  return {
    access_token: token,
    user,
  };
}

export const auth = {
  async signUp({ email, password, options = {} }) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: options.data?.full_name,
      }),
    });

    setStoredToken(data.session.access_token);
    notifyAuthChange('SIGNED_IN', buildSession(data.session.access_token, data.user));

    return { data, error: null };
  },

  async signInWithPassword({ email, password }) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setStoredToken(data.session.access_token);
    notifyAuthChange('SIGNED_IN', buildSession(data.session.access_token, data.user));

    return { data, error: null };
  },

  async signOut() {
    setStoredToken(null);
    notifyAuthChange('SIGNED_OUT', null);
    return { error: null };
  },

  async getSession() {
    const token = getStoredToken();

    if (!token) {
      return { data: { session: null }, error: null };
    }

    try {
      const data = await apiFetch('/auth/me');
      return {
        data: {
          session: buildSession(token, data.user),
        },
        error: null,
      };
    } catch {
      setStoredToken(null);
      return { data: { session: null }, error: null };
    }
  },

  async getUser() {
    const { data: { session } } = await this.getSession();
    return {
      data: { user: session?.user ?? null },
      error: null,
    };
  },

  onAuthStateChange(callback) {
    listeners.add(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => listeners.delete(callback),
        },
      },
    };
  },

  async deleteAccount() {
    await apiFetch('/auth/account', { method: 'DELETE' });
    await this.signOut();
  },

  async forgotPassword(email) {
    return apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token, password) {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  async verifyEmail(token) {
    return apiFetch(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  },

  async resendVerification() {
    return apiFetch('/auth/resend-verification', { method: 'POST' });
  },
};
