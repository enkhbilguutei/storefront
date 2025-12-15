/**
 * Auth Flow Tests
 * 
 * Tests the complete authentication flow with Medusa backend:
 * 1. Registration
 * 2. Customer profile creation
 * 3. Login
 * 4. Profile retrieval
 */

import { loginSchema, registerSchema } from "../lib/validations";

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';

// Generate unique email for each test run
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'password123';
const testFirstName = 'Test';
const testLastName = 'User';

describe('Medusa Auth Flow', () => {
  let registrationToken: string;
  let loginToken: string;
  let customerId: string;

  describe('1. Registration', () => {
    it('should register a new user and return a token', async () => {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.token).toBeDefined();
      expect(typeof data.token).toBe('string');
      registrationToken = data.token;
    });

    it('should fail to register with existing email', async () => {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      expect(response.ok).toBe(false);
    });
  });

  describe('2. Customer Profile Creation', () => {
    it('should create customer profile with registration token', async () => {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/store/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${registrationToken}`,
          'x-publishable-api-key': PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          email: testEmail,
          first_name: testFirstName,
          last_name: testLastName,
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.customer).toBeDefined();
      expect(data.customer.email).toBe(testEmail);
      expect(data.customer.first_name).toBe(testFirstName);
      expect(data.customer.last_name).toBe(testLastName);
      customerId = data.customer.id;
    });

    it('registration token should NOT be able to access /store/customers/me', async () => {
      // This is expected behavior - registration token has empty actor_id
      const response = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
        headers: {
          'Authorization': `Bearer ${registrationToken}`,
          'x-publishable-api-key': PUBLISHABLE_KEY,
        },
      });

      expect(response.ok).toBe(false);
    });
  });

  describe('3. Login', () => {
    it('should login and return a token with customer actor_id', async () => {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.token).toBeDefined();
      loginToken = data.token;

      // Decode JWT to verify actor_id is set
      const payload = JSON.parse(atob(loginToken.split('.')[1]));
      expect(payload.actor_id).toBe(customerId);
      expect(payload.actor_type).toBe('customer');
    });

    it('should fail login with wrong password', async () => {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: 'wrongpassword',
        }),
      });

      expect(response.ok).toBe(false);
    });

    it('should fail login with non-existent email', async () => {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/auth/customer/emailpass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: testPassword,
        }),
      });

      expect(response.ok).toBe(false);
    });
  });

  describe('4. Profile Retrieval', () => {
    it('should fetch customer profile with login token', async () => {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
        headers: {
          'Authorization': `Bearer ${loginToken}`,
          'x-publishable-api-key': PUBLISHABLE_KEY,
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.customer).toBeDefined();
      expect(data.customer.id).toBe(customerId);
      expect(data.customer.email).toBe(testEmail);
      expect(data.customer.first_name).toBe(testFirstName);
      expect(data.customer.last_name).toBe(testLastName);
    });

    it('should fail without publishable API key', async () => {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
        headers: {
          'Authorization': `Bearer ${loginToken}`,
        },
      });

      expect(response.ok).toBe(false);
    });

    it('should fail without authorization header', async () => {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_KEY,
        },
      });

      expect(response.ok).toBe(false);
    });
  });
});

describe('Validation Schema Tests', () => {
  describe('Login Schema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Register Schema', () => {
    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });
      expect(result.success).toBe(true);
    });

    it('should reject password mismatch', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'differentpassword',
        firstName: 'Test',
        lastName: 'User',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123',
        firstName: 'Test',
        lastName: 'User',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty names', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        firstName: '',
        lastName: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
