import { redirect, type RequestEvent } from '@sveltejs/kit';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/lucia-auth/session.js';

export const signoutHandler = async (event: RequestEvent) => {
	if (!event.locals.session) {
		return redirect(302, '/');
	}
	await invalidateSession(event.locals.session.id);
	deleteSessionTokenCookie(event);

	return redirect(302, '/');
};
