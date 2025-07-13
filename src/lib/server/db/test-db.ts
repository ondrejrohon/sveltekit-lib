import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// TODO: use env variables
const testClient = postgres('postgres://ondrejrohon@localhost:5432/slova_test_db');
export const testDb = drizzle(testClient);
