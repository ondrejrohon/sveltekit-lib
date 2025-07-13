import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const layoutLoadHandler = async (event: RequestEvent) => {
	if (!event.locals.user) {
		return {};
	}

	if (!event.locals.user.emailVerified && event.url.pathname !== '/verify-email') {
		return redirect(302, '/verify-email');
	}

	return { user: event.locals.user };
};
