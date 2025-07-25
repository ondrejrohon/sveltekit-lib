import { fail, redirect } from '@sveltejs/kit';
import { RefillingTokenBucket, Throttler } from '$lib/server/lucia-auth/rate-limit.js';
import type { Actions, RequestEvent } from '@sveltejs/kit';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie
} from '$lib/server/lucia-auth/session.js';
import { getUserFromEmail, getUserPasswordHash } from '$lib/server/lucia-auth/user.js';
import { verifyPasswordHash } from '$lib/server/lucia-auth/password.js';
import { verifyEmailInput } from '$lib/server/lucia-auth/email.js';

export const loginLoadHandler = async (event: RequestEvent) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

const throttler = new Throttler<string>([0, 1, 2, 4, 8, 16, 30, 60, 180, 300]);
const ipBucket = new RefillingTokenBucket<string>(20, 1);

export const loginActions: Actions = {
	login: async (event: RequestEvent) => {
		// TODO: Assumes X-Forwarded-For is always included.
		const clientIP = event.request.headers.get('X-Forwarded-For');
		if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
			return fail(429, {
				message: 'Too many requests',
				email: ''
			});
		}

		const formData = await event.request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		if (typeof email !== 'string' || typeof password !== 'string') {
			return fail(400, {
				message: 'Invalid or missing fields',
				email: ''
			});
		}
		if (email === '' || password === '') {
			return fail(400, {
				message: 'Please enter your email and password.',
				email
			});
		}
		if (!verifyEmailInput(email)) {
			return fail(400, {
				message: 'Invalid email',
				email
			});
		}
		const user = await getUserFromEmail(email);
		if (!user) {
			return fail(400, {
				message: 'Account does not exist',
				email
			});
		}
		if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
			return fail(429, {
				message: 'Too many requests',
				email: ''
			});
		}
		if (!throttler.consume(user.id)) {
			return fail(429, {
				message: 'Too many requests',
				email: ''
			});
		}
		const passwordHash = await getUserPasswordHash(user.id);
		const validPassword = await verifyPasswordHash(passwordHash, password);
		if (!validPassword) {
			return fail(400, {
				message: 'Invalid password',
				email
			});
		}
		throttler.reset(user.id);
		// const sessionFlags: SessionFlags = {
		// 	twoFactorVerified: false
		// };
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, user.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		if (!user.emailVerified) {
			return redirect(302, '/verify-email');
		}
		// if (!user.registered2FA) {
		// 	return redirect(302, '/2fa/setup');
		// }
		// return redirect(302, '/2fa');
		return redirect(302, '/');
	}
};
