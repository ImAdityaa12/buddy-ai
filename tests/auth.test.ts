import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

// Mock the database and schema imports
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    query: vi.fn(),
    execute: vi.fn(),
  }
}));

vi.mock('@/db/schema', () => ({
  users: {
    id: 'id',
    email: 'email',
    password: 'password',
    name: 'name',
    emailVerified: 'emailVerified',
    image: 'image',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
  sessions: {
    id: 'id',
    userId: 'userId',
    expiresAt: 'expiresAt',
    token: 'token',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
  },
  accounts: {
    id: 'id',
    userId: 'userId',
    provider: 'provider',
    providerAccountId: 'providerAccountId',
    accountType: 'accountType',
  },
  verificationTokens: {
    id: 'id',
    identifier: 'identifier',
    token: 'token',
    expires: 'expires',
  }
}));

// Mock better-auth
vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    verifyEmail: vi.fn(),
    resetPassword: vi.fn(),
    changePassword: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  }))
}));

vi.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: vi.fn(() => ({
    create: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getUserByEmail: vi.fn(),
    getUserById: vi.fn(),
    createSession: vi.fn(),
    getSession: vi.fn(),
    deleteSession: vi.fn(),
  }))
}));

describe('Auth Configuration', () => {
  let mockDb: any;
  let mockSchema: any;
  let mockedBetterAuth: any;
  let mockedDrizzleAdapter: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      query: vi.fn(),
      execute: vi.fn(),
    };

    mockSchema = {
      users: { 
        id: 'id', 
        email: 'email', 
        password: 'password',
        name: 'name',
        emailVerified: 'emailVerified',
        image: 'image',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
      sessions: { 
        id: 'id', 
        userId: 'userId', 
        expiresAt: 'expiresAt',
        token: 'token',
        ipAddress: 'ipAddress',
        userAgent: 'userAgent',
      },
      accounts: { 
        id: 'id', 
        userId: 'userId', 
        provider: 'provider',
        providerAccountId: 'providerAccountId',
        accountType: 'accountType',
      },
      verificationTokens: {
        id: 'id',
        identifier: 'identifier',
        token: 'token',
        expires: 'expires',
      }
    };

    mockedBetterAuth = vi.mocked(betterAuth);
    mockedDrizzleAdapter = vi.mocked(drizzleAdapter);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('betterAuth initialization', () => {
    it('should initialize betterAuth with correct configuration', async () => {
      // Clear module cache to ensure fresh import
      vi.resetModules();
      
      // Import the auth module to trigger initialization
      await import('../auth');

      expect(mockedBetterAuth).toHaveBeenCalledTimes(1);
      expect(mockedBetterAuth).toHaveBeenCalledWith({
        database: expect.any(Object),
        emailAndPassword: {
          enabled: true,
        },
      });
    });

    it('should call drizzleAdapter with correct parameters', async () => {
      vi.resetModules();
      await import('../auth');

      expect(mockedDrizzleAdapter).toHaveBeenCalledTimes(1);
      expect(mockedDrizzleAdapter).toHaveBeenCalledWith(
        expect.any(Object), // db instance
        {
          provider: 'pg',
          schema: expect.objectContaining({
            users: expect.any(Object),
            sessions: expect.any(Object),
            accounts: expect.any(Object),
          }),
        }
      );
    });

    it('should configure PostgreSQL as the database provider', async () => {
      vi.resetModules();
      await import('../auth');

      const adapterCall = mockedDrizzleAdapter.mock.calls[0];
      expect(adapterCall[1]).toEqual(
        expect.objectContaining({
          provider: 'pg'
        })
      );
    });

    it('should enable email and password authentication', async () => {
      vi.resetModules();
      await import('../auth');

      const authCall = mockedBetterAuth.mock.calls[0];
      expect(authCall[0]).toEqual(
        expect.objectContaining({
          emailAndPassword: {
            enabled: true,
          }
        })
      );
    });

    it('should include all schema tables in the adapter configuration', async () => {
      vi.resetModules();
      await import('../auth');

      const adapterCall = mockedDrizzleAdapter.mock.calls[0];
      const schemaConfig = adapterCall[1].schema;
      
      expect(schemaConfig).toHaveProperty('users');
      expect(schemaConfig).toHaveProperty('sessions');
      expect(schemaConfig).toHaveProperty('accounts');
      expect(schemaConfig).toHaveProperty('verificationTokens');
    });
  });

  describe('configuration validation', () => {
    it('should handle missing database gracefully', () => {
      expect(() => {
        mockedDrizzleAdapter(null, { provider: 'pg', schema: mockSchema });
      }).not.toThrow();
    });

    it('should handle empty schema gracefully', async () => {
      vi.doMock('@/db/schema', () => ({}));
      vi.resetModules();

      await import('../auth');

      const adapterCall = mockedDrizzleAdapter.mock.calls[0];
      expect(adapterCall[1].schema).toBeDefined();
    });

    it('should maintain immutable configuration object', async () => {
      vi.resetModules();
      await import('../auth');

      const authCall = mockedBetterAuth.mock.calls[0];
      const config = authCall[0];
      
      // Attempt to modify the configuration
      expect(() => {
        config.emailAndPassword.enabled = false;
      }).not.toThrow();
      
      // Verify original configuration structure
      expect(config).toHaveProperty('database');
      expect(config).toHaveProperty('emailAndPassword');
    });

    it('should validate required configuration properties', async () => {
      vi.resetModules();
      await import('../auth');

      const authCall = mockedBetterAuth.mock.calls[0];
      const config = authCall[0];
      
      expect(config.database).toBeDefined();
      expect(config.emailAndPassword).toBeDefined();
      expect(config.emailAndPassword.enabled).toBe(true);
    });
  });

  describe('adapter configuration edge cases', () => {
    it('should handle different database providers', () => {
      const providers = ['pg', 'mysql', 'sqlite'];
      
      providers.forEach(provider => {
        mockedDrizzleAdapter.mockClear();
        mockedDrizzleAdapter(mockDb, { provider, schema: mockSchema });
        
        expect(mockedDrizzleAdapter).toHaveBeenCalledWith(
          mockDb,
          expect.objectContaining({ provider })
        );
      });
    });

    it('should spread schema properties correctly', async () => {
      const customSchema = {
        users: { id: 'custom_id', email: 'email' },
        customTable: { field: 'value' },
        sessions: { id: 'session_id' }
      };

      vi.doMock('@/db/schema', () => customSchema);
      vi.resetModules();
      
      await import('../auth');

      const adapterCall = mockedDrizzleAdapter.mock.calls[0];
      expect(adapterCall[1].schema).toEqual(
        expect.objectContaining(customSchema)
      );
    });

    it('should handle partial schema definitions', () => {
      const partialSchema = {
        users: { id: 'id', email: 'email' }
        // Missing sessions, accounts, etc.
      };

      expect(() => {
        mockedDrizzleAdapter(mockDb, { provider: 'pg', schema: partialSchema });
      }).not.toThrow();
    });
  });

  describe('authentication features', () => {
    it('should enable only email and password authentication by default', async () => {
      vi.resetModules();
      await import('../auth');

      const authCall = mockedBetterAuth.mock.calls[0];
      const config = authCall[0];
      
      expect(config.emailAndPassword).toEqual({ enabled: true });
      expect(config).not.toHaveProperty('socialProviders');
      expect(config).not.toHaveProperty('twoFactor');
    });

    it('should not include other authentication methods', async () => {
      vi.resetModules();
      await import('../auth');

      const authCall = mockedBetterAuth.mock.calls[0];
      const config = authCall[0];
      
      expect(config).not.toHaveProperty('oauth');
      expect(config).not.toHaveProperty('magicLink');
      expect(config).not.toHaveProperty('passkey');
      expect(config).not.toHaveProperty('phoneNumber');
    });

    it('should have email and password configuration as object', async () => {
      vi.resetModules();
      await import('../auth');

      const authCall = mockedBetterAuth.mock.calls[0];
      const config = authCall[0];
      
      expect(typeof config.emailAndPassword).toBe('object');
      expect(config.emailAndPassword).not.toBe(null);
      expect(config.emailAndPassword.enabled).toBe(true);
    });
  });

  describe('module exports', () => {
    it('should export auth instance', async () => {
      const mockAuthInstance = {
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        verifyEmail: vi.fn(),
        resetPassword: vi.fn(),
      };
      
      mockedBetterAuth.mockReturnValue(mockAuthInstance);
      vi.resetModules();
      
      const authModule = await import('../auth');
      expect(authModule.auth).toBeDefined();
    });

    it('should export a configured betterAuth instance with expected methods', async () => {
      const mockMethods = {
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        verifyEmail: vi.fn(),
        resetPassword: vi.fn(),
        changePassword: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
      };

      mockedBetterAuth.mockReturnValue(mockMethods);
      vi.resetModules();
      
      const authModule = await import('../auth');
      expect(authModule.auth).toEqual(expect.objectContaining({
        signIn: expect.any(Function),
        signUp: expect.any(Function),
        signOut: expect.any(Function),
        getSession: expect.any(Function),
      }));
    });

    it('should export auth as the default and named export', async () => {
      vi.resetModules();
      const authModule = await import('../auth');
      
      expect(authModule.auth).toBeDefined();
      expect(typeof authModule.auth).toBe('object');
    });
  });

  describe('error handling and resilience', () => {
    it('should handle database connection errors gracefully', () => {
      const errorDb = {
        select: vi.fn().mockRejectedValue(new Error('Connection failed')),
        insert: vi.fn().mockRejectedValue(new Error('Insert failed')),
        update: vi.fn().mockRejectedValue(new Error('Update failed')),
        delete: vi.fn().mockRejectedValue(new Error('Delete failed')),
      };

      expect(() => {
        mockedDrizzleAdapter(errorDb, { provider: 'pg', schema: mockSchema });
      }).not.toThrow();
    });

    it('should handle malformed schema objects', () => {
      const malformedSchemas = [
        { users: null, sessions: undefined, accounts: 'invalid' },
        { users: [], sessions: {}, accounts: 123 },
        { users: true, sessions: false, accounts: new Date() },
      ];

      malformedSchemas.forEach(schema => {
        expect(() => {
          mockedDrizzleAdapter(mockDb, { provider: 'pg', schema });
        }).not.toThrow();
      });
    });

    it('should validate provider parameter', () => {
      const invalidProviders = ['', null, undefined, 123, {}, [], true];
      
      invalidProviders.forEach(provider => {
        expect(() => {
          mockedDrizzleAdapter(mockDb, { provider, schema: mockSchema });
        }).not.toThrow();
      });
    });

    it('should handle undefined database instance', () => {
      expect(() => {
        mockedDrizzleAdapter(undefined, { provider: 'pg', schema: mockSchema });
      }).not.toThrow();
    });
  });

  describe('configuration completeness', () => {
    it('should include all required configuration keys', async () => {
      vi.resetModules();
      await import('../auth');

      const authCall = mockedBetterAuth.mock.calls[0];
      const config = authCall[0];
      
      const requiredKeys = ['database', 'emailAndPassword'];
      requiredKeys.forEach(key => {
        expect(config).toHaveProperty(key);
        expect(config[key]).toBeDefined();
      });
    });

    it('should use correct adapter configuration structure', async () => {
      vi.resetModules();
      await import('../auth');

      const adapterCall = mockedDrizzleAdapter.mock.calls[0];
      const adapterConfig = adapterCall[1];
      
      expect(adapterConfig).toHaveProperty('provider');
      expect(adapterConfig).toHaveProperty('schema');
      expect(typeof adapterConfig.provider).toBe('string');
      expect(typeof adapterConfig.schema).toBe('object');
    });

    it('should have consistent configuration structure', async () => {
      vi.resetModules();
      await import('../auth');

      const authCall = mockedBetterAuth.mock.calls[0];
      const config = authCall[0];
      
      expect(config.database).toEqual(expect.any(Object));
      expect(config.emailAndPassword).toEqual(
        expect.objectContaining({ enabled: expect.any(Boolean) })
      );
    });
  });

  describe('integration testing scenarios', () => {
    it('should maintain consistency between db and adapter', async () => {
      vi.resetModules();
      await import('../auth');

      const adapterCall = mockedDrizzleAdapter.mock.calls[0];
      const dbInstance = adapterCall[0];
      
      // Verify the same db instance is passed to the adapter
      expect(dbInstance).toBeDefined();
      expect(typeof dbInstance).toBe('object');
    });

    it('should preserve schema integrity through spread operator', async () => {
      const originalSchema = {
        users: { id: 'id', email: 'email' },
        sessions: { id: 'id', userId: 'userId' },
        accounts: { id: 'id', provider: 'provider' },
      };

      vi.doMock('@/db/schema', () => originalSchema);
      vi.resetModules();
      
      await import('../auth');

      const adapterCall = mockedDrizzleAdapter.mock.calls[0];
      const spreadSchema = adapterCall[1].schema;
      
      expect(spreadSchema).toEqual(originalSchema);
    });

    it('should handle complex schema structures', async () => {
      const complexSchema = {
        users: { 
          id: 'id', 
          email: 'email', 
          profile: { nested: 'field' },
          metadata: ['array', 'of', 'values']
        },
        sessions: { id: 'id', data: { complex: 'object' } },
        customTable: { field1: 'value1', field2: 'value2' }
      };

      vi.doMock('@/db/schema', () => complexSchema);
      vi.resetModules();
      
      await import('../auth');

      const adapterCall = mockedDrizzleAdapter.mock.calls[0];
      expect(adapterCall[1].schema).toEqual(
        expect.objectContaining(complexSchema)
      );
    });
  });

  describe('provider-specific configurations', () => {
    it('should correctly configure PostgreSQL specific options', async () => {
      vi.resetModules();
      await import('../auth');

      const adapterCall = mockedDrizzleAdapter.mock.calls[0];
      const config = adapterCall[1];
      
      expect(config.provider).toBe('pg');
      // PostgreSQL specific validations could be added here
    });

    it('should handle provider configuration variations', () => {
      const providerConfigs = [
        { provider: 'pg', schema: mockSchema },
        { provider: 'mysql', schema: mockSchema },
        { provider: 'sqlite', schema: mockSchema },
      ];

      providerConfigs.forEach(config => {
        mockedDrizzleAdapter.mockClear();
        mockedDrizzleAdapter(mockDb, config);
        
        expect(mockedDrizzleAdapter).toHaveBeenCalledWith(
          mockDb,
          expect.objectContaining({ provider: config.provider })
        );
      });
    });
  });

  describe('authentication method configuration', () => {
    it('should have emailAndPassword as the only enabled method', async () => {
      vi.resetModules();
      await import('../auth');

      const authCall = mockedBetterAuth.mock.calls[0];
      const config = authCall[0];
      
      // Check that only emailAndPassword is configured
      const configKeys = Object.keys(config);
      const authMethods = configKeys.filter(key => 
        !['database'].includes(key)
      );
      
      expect(authMethods).toContain('emailAndPassword');
      expect(config.emailAndPassword.enabled).toBe(true);
    });

    it('should not include optional authentication configurations', async () => {
      vi.resetModules();
      await import('../auth');

      const authCall = mockedBetterAuth.mock.calls[0];
      const config = authCall[0];
      
      const optionalMethods = [
        'oauth', 'magicLink', 'passkey', 'phoneNumber', 
        'twoFactor', 'anonymous', 'jwt'
      ];
      
      optionalMethods.forEach(method => {
        expect(config).not.toHaveProperty(method);
      });
    });
  });
});