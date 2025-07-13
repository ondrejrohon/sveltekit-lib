export { google } from './server/oauth.js';
export { db } from './server/db/index.js';

export { authHandler } from './server/handlers/auth-handler.js';
export {
	verificationLoadHandler,
	verificationActions
} from './server/handlers/verification-page-handler.js';
export { googleLoginCallbackHandler } from './server/handlers/google-login-callback-handler.js';
export { googleLoginHandler } from './server/handlers/google-login-handler.js';
export { layoutLoadHandler } from './server/handlers/layout-load-handler.js';
export { signupLoadHandler, signupActions } from './server/handlers/signup-handler.js';
export { signoutHandler } from './server/handlers/signout-handler.js';
export {
	resetPasswordLoadHandler,
	resetPasswordActions
} from './server/handlers/reset-password-handler.js';
export {
	resetPasswordVerificationLoadHandler,
	resetPasswordVerificationActions
} from './server/handlers/reset-password-verification-handler.js';
export { loginLoadHandler, loginActions } from './server/handlers/login-handler.js';
export { forgotPasswordActions } from './server/handlers/forgot-password-handler.js';
