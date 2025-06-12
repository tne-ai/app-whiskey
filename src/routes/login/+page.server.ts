import { AUTH_USERS } from '../../config/auth';
import { redirect, fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, cookies }: { request: Request; cookies: any }) => {
    let username: string, password: string;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await request.json();
      username = data.username;
      password = data.password;
    } else {
      const form = await request.formData();
      username = form.get('username') as string;
      password = form.get('password') as string;
    }
    const user = AUTH_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      cookies.set('auth_token', user.username, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 8 // 8 hours
      });
      throw redirect(303, '/');
    }
    return fail(401, { error: 'Invalid username or password' });
  }
};
