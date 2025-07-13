export { google } from './server/oauth.js';
export { db } from './server/db/index.js';

export { authHandler } from './server/handlers/auth-handler.js';
export {
	verificationLoadHandler,
	verificationActions
} from './server/handlers/verification-page-handler.js';
export { googleLoginCallbackHandler } from './server/handlers/google-login-callback-handler.js';
export { googleLoginHandler } from './server/handlers/google-login-handler.js';
