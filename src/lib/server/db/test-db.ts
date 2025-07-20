import { TEST_DATABASE_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const testClient = postgres(TEST_DATABASE_URL);
export const testDb = drizzle(testClient);
