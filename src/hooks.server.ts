import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

const PUBLIC_ROUTES = ['/login'];

// Add typing for event.locals.user
export const handle: Handle = async ({ event, resolve }) => {
  const authToken = event.cookies.get('auth_token');
  if (!authToken && !PUBLIC_ROUTES.includes(event.url.pathname)) {
    throw redirect(303, '/login');
  }
  // Make username available to load functions/layout
  event.locals.user = authToken ? { username: authToken } : null;
  return resolve(event);
};
