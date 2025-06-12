import { redirect } from '@sveltejs/kit';

export async function GET({ cookies }) {
  cookies.delete('auth_token', { path: '/' });
  throw redirect(303, '/login');
}
