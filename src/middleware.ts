import { defineMiddleware } from 'astro:middleware';
import { getSessionToken, getSessionUser } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname;

  if (path.startsWith('/admin') && path !== '/admin/login') {
    const user = await getSessionUser(getSessionToken(context.cookies));
    if (!user || user.role !== 'admin') {
      return context.redirect('/admin/login');
    }
    context.locals.user = user;
  }

  if (path.startsWith('/portal') && path !== '/portal/login') {
    const user = await getSessionUser(getSessionToken(context.cookies));
    if (!user || user.role !== 'brand') {
      return context.redirect('/portal/login');
    }
    context.locals.user = user;
  }

  return next();
});

declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'admin' | 'brand';
        brandId: string | null;
      };
    }
  }
}
