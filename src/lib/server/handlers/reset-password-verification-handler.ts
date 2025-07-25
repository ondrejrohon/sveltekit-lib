import {
	validatePasswordResetSessionRequest,
	setPasswordResetSessionAsEmailVerified
} from '$lib/server/lucia-auth/password-reset.js';
import { ExpiringTokenBucket } from '$lib/server/lucia-auth/rate-limit.js';
import { setUserAsEmailVerifiedIfEmailMatches } from '$lib/server/lucia-auth/user.js';
import { fail, redirect } from '@sveltejs/kit';

import type { Actions, RequestEvent } from '@sveltejs/kit';

const bucket = new ExpiringTokenBucket<string>(5, 60 * 30);

export async function resetPasswordVerificationLoadHandler(event: RequestEvent) {
	const { session } = await validatePasswordResetSessionRequest(event);
	if (session === null) {
		return redirect(302, '/forgot-password');
	}
	if (session.emailVerified) {
		// if (!session.twoFactorVerified) {
		// 	return redirect(302, "/reset-password/2fa");
		// }
		return redirect(302, '/reset-password');
	}
	return {
		email: session.email
	};
}

export const resetPasswordVerificationActions: Actions = {
	default: action
};

async function action(event: RequestEvent) {
	const { session } = await validatePasswordResetSessionRequest(event);
	if (session === null) {
		return fail(401, {
			message: 'Not authenticated'
		});
	}
	if (session.emailVerified) {
		return fail(403, {
			message: 'Forbidden'
		});
	}
	if (!bucket.check(session.userId, 1)) {
		return fail(429, {
			message: 'Too many requests'
		});
	}

	const formData = await event.request.formData();
	const code = formData.get('code');
	if (typeof code !== 'string') {
		return fail(400, {
			message: 'Invalid or missing fields'
		});
	}
	if (code === '') {
		return fail(400, {
			message: 'Please enter your code'
		});
	}
	if (!bucket.consume(session.userId, 1)) {
		return fail(429, { message: 'Too many requests' });
	}
	if (code !== session.code) {
		return fail(400, {
			message: 'Incorrect code'
		});
	}
	bucket.reset(session.userId);
	setPasswordResetSessionAsEmailVerified(session.id);
	const emailMatches = setUserAsEmailVerifiedIfEmailMatches(session.userId, session.email);
	if (!emailMatches) {
		return fail(400, {
			message: 'Please restart the process'
		});
	}
	return redirect(302, '/reset-password/2fa');
}
