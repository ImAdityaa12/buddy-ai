import { createAuthClient } from 'better-auth/react';

// Mock the better-auth/react module
jest.mock('better-auth/react', () => ({
  createAuthClient: jest.fn()
}));

const mockCreateAuthClient = createAuthClient as jest.MockedFunction<typeof createAuthClient>;

describe('Auth Client Module (src/lib/auth-client.ts)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('authClient instantiation', () => {
    it('should call createAuthClient with no arguments when module is imported', () => {
      // Mock the return value before importing
      const mockAuthClientInstance = {
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn(),
        useSession: jest.fn(),
        getSession: jest.fn()
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      // Import the module to trigger createAuthClient call
      const authClientModule = require('../src/lib/auth-client');
      
      expect(mockCreateAuthClient).toHaveBeenCalledTimes(1);
      expect(mockCreateAuthClient).toHaveBeenCalledWith();
      expect(authClientModule.authClient).toBe(mockAuthClientInstance);
    });

    it('should export a valid auth client instance with expected methods', () => {
      const mockAuthClientInstance = {
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn(),
        useSession: jest.fn(),
        getSession: jest.fn(),
        updateUser: jest.fn(),
        resetPassword: jest.fn(),
        verifyEmail: jest.fn(),
        changePassword: jest.fn(),
        deleteUser: jest.fn()
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      const { authClient } = require('../src/lib/auth-client');
      
      // Verify all essential authentication methods exist
      expect(authClient).toHaveProperty('signIn');
      expect(authClient).toHaveProperty('signOut');
      expect(authClient).toHaveProperty('signUp');
      expect(authClient).toHaveProperty('useSession');
      expect(authClient).toHaveProperty('getSession');
      
      // Verify methods are functions
      expect(typeof authClient.signIn).toBe('function');
      expect(typeof authClient.signOut).toBe('function');
      expect(typeof authClient.signUp).toBe('function');
      expect(typeof authClient.useSession).toBe('function');
      expect(typeof authClient.getSession).toBe('function');
    });

    it('should handle createAuthClient throwing an initialization error', () => {
      const initError = new Error('Failed to initialize auth client - invalid configuration');
      mockCreateAuthClient.mockImplementation(() => {
        throw initError;
      });
      
      expect(() => {
        require('../src/lib/auth-client');
      }).toThrow('Failed to initialize auth client - invalid configuration');
      
      expect(mockCreateAuthClient).toHaveBeenCalledWith();
    });

    it('should handle createAuthClient returning null gracefully', () => {
      mockCreateAuthClient.mockReturnValue(null as any);
      
      const { authClient } = require('../src/lib/auth-client');
      
      expect(authClient).toBeNull();
      expect(mockCreateAuthClient).toHaveBeenCalledTimes(1);
    });

    it('should handle createAuthClient returning undefined gracefully', () => {
      mockCreateAuthClient.mockReturnValue(undefined as any);
      
      const { authClient } = require('../src/lib/auth-client');
      
      expect(authClient).toBeUndefined();
      expect(mockCreateAuthClient).toHaveBeenCalledTimes(1);
    });
  });

  describe('singleton behavior and module caching', () => {
    it('should return the same auth client instance on multiple imports', () => {
      const mockAuthClientInstance = {
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn(),
        useSession: jest.fn()
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      // Import multiple times
      const { authClient: client1 } = require('../src/lib/auth-client');
      const { authClient: client2 } = require('../src/lib/auth-client');
      const { authClient: client3 } = require('../src/lib/auth-client');
      
      // All imports should return the same instance
      expect(client1).toBe(client2);
      expect(client2).toBe(client3);
      expect(client1).toBe(mockAuthClientInstance);
      
      // createAuthClient should only be called once due to module caching
      expect(mockCreateAuthClient).toHaveBeenCalledTimes(1);
    });

    it('should not recreate auth client on subsequent requires', () => {
      const mockAuthClientInstance = {
        signIn: jest.fn(),
        signOut: jest.fn()
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      // Require the module multiple times
      require('../src/lib/auth-client');
      require('../src/lib/auth-client');
      require('../src/lib/auth-client');
      require('../src/lib/auth-client');
      
      // createAuthClient should only be invoked once
      expect(mockCreateAuthClient).toHaveBeenCalledTimes(1);
    });

    it('should maintain instance state across imports', () => {
      const mockAuthClientInstance = {
        signIn: jest.fn(),
        signOut: jest.fn(),
        currentUser: null,
        setCurrentUser: jest.fn()
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      // First import and modify state
      const { authClient: client1 } = require('../src/lib/auth-client');
      client1.currentUser = { id: '123', name: 'Test User' };
      
      // Second import should have the same state
      const { authClient: client2 } = require('../src/lib/auth-client');
      
      expect(client2.currentUser).toEqual({ id: '123', name: 'Test User' });
      expect(client1).toBe(client2);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle network errors during client creation', () => {
      const networkError = new Error('Network error: Unable to reach auth server');
      networkError.name = 'NetworkError';
      
      mockCreateAuthClient.mockImplementation(() => {
        throw networkError;
      });
      
      expect(() => {
        require('../src/lib/auth-client');
      }).toThrow('Network error: Unable to reach auth server');
    });

    it('should handle invalid configuration errors', () => {
      const configError = new Error('Invalid configuration: Missing required API key');
      configError.name = 'ConfigurationError';
      
      mockCreateAuthClient.mockImplementation(() => {
        throw configError;
      });
      
      expect(() => {
        require('../src/lib/auth-client');
      }).toThrow('Invalid configuration: Missing required API key');
    });

    it('should handle createAuthClient returning an object without expected methods', () => {
      const incompleteClient = {
        signIn: jest.fn()
        // Missing signOut, signUp, etc.
      };
      
      mockCreateAuthClient.mockReturnValue(incompleteClient);
      
      const { authClient } = require('../src/lib/auth-client');
      
      expect(authClient).toHaveProperty('signIn');
      expect(authClient).not.toHaveProperty('signOut');
      expect(authClient).not.toHaveProperty('signUp');
    });

    it('should handle createAuthClient returning a non-object value', () => {
      mockCreateAuthClient.mockReturnValue('invalid-client' as any);
      
      const { authClient } = require('../src/lib/auth-client');
      
      expect(authClient).toBe('invalid-client');
    });

    it('should gracefully handle when better-auth module is not available', () => {
      // Reset the mock to simulate module not found
      jest.doMock('better-auth/react', () => {
        throw new Error('Module not found: better-auth/react');
      });
      
      expect(() => {
        require('../src/lib/auth-client');
      }).toThrow('Module not found: better-auth/react');
    });
  });

  describe('TypeScript type safety and interface compliance', () => {
    it('should maintain expected method signatures for authentication', () => {
      const mockAuthClientInstance = {
        signIn: jest.fn().mockResolvedValue({ success: true, user: { id: '1' } }),
        signOut: jest.fn().mockResolvedValue({ success: true }),
        signUp: jest.fn().mockResolvedValue({ success: true, user: { id: '2' } }),
        useSession: jest.fn().mockReturnValue({ data: null, isLoading: false }),
        getSession: jest.fn().mockResolvedValue(null)
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      const { authClient } = require('../src/lib/auth-client');
      
      // Verify method return types and structure
      expect(typeof authClient.signIn).toBe('function');
      expect(typeof authClient.signOut).toBe('function');
      expect(typeof authClient.signUp).toBe('function');
      expect(typeof authClient.useSession).toBe('function');
      expect(typeof authClient.getSession).toBe('function');
      
      // Verify methods can be called
      expect(() => authClient.signIn()).not.toThrow();
      expect(() => authClient.signOut()).not.toThrow();
      expect(() => authClient.useSession()).not.toThrow();
    });

    it('should handle async method calls correctly', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockAuthClientInstance = {
        signIn: jest.fn().mockResolvedValue({ success: true, user: mockUser }),
        signOut: jest.fn().mockResolvedValue({ success: true }),
        getSession: jest.fn().mockResolvedValue({ user: mockUser })
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      const { authClient } = require('../src/lib/auth-client');
      
      // Test async method calls
      const signInResult = await authClient.signIn();
      const signOutResult = await authClient.signOut();
      const sessionResult = await authClient.getSession();
      
      expect(signInResult).toEqual({ success: true, user: mockUser });
      expect(signOutResult).toEqual({ success: true });
      expect(sessionResult).toEqual({ user: mockUser });
      
      expect(mockAuthClientInstance.signIn).toHaveBeenCalled();
      expect(mockAuthClientInstance.signOut).toHaveBeenCalled();
      expect(mockAuthClientInstance.getSession).toHaveBeenCalled();
    });

    it('should handle method calls with parameters', async () => {
      const mockAuthClientInstance = {
        signIn: jest.fn().mockResolvedValue({ success: true }),
        signUp: jest.fn().mockResolvedValue({ success: true }),
        updateUser: jest.fn().mockResolvedValue({ success: true }),
        resetPassword: jest.fn().mockResolvedValue({ success: true })
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      const { authClient } = require('../src/lib/auth-client');
      
      // Test method calls with parameters
      await authClient.signIn('user@example.com', 'password123');
      await authClient.signUp('newuser@example.com', 'newpassword123');
      await authClient.updateUser({ name: 'Updated Name' });
      await authClient.resetPassword('user@example.com');
      
      expect(mockAuthClientInstance.signIn).toHaveBeenCalledWith('user@example.com', 'password123');
      expect(mockAuthClientInstance.signUp).toHaveBeenCalledWith('newuser@example.com', 'newpassword123');
      expect(mockAuthClientInstance.updateUser).toHaveBeenCalledWith({ name: 'Updated Name' });
      expect(mockAuthClientInstance.resetPassword).toHaveBeenCalledWith('user@example.com');
    });
  });

  describe('React integration readiness', () => {
    it('should provide React hooks for session management', () => {
      const mockSessionData = { user: { id: '123' }, isLoading: false };
      const mockAuthClientInstance = {
        signIn: jest.fn(),
        signOut: jest.fn(),
        useSession: jest.fn().mockReturnValue(mockSessionData),
        useUser: jest.fn().mockReturnValue({ id: '123' })
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      const { authClient } = require('../src/lib/auth-client');
      
      expect(typeof authClient.useSession).toBe('function');
      
      const sessionResult = authClient.useSession();
      expect(sessionResult).toEqual(mockSessionData);
      expect(mockAuthClientInstance.useSession).toHaveBeenCalled();
    });

    it('should be compatible with React component patterns', () => {
      const mockAuthClientInstance = {
        signIn: jest.fn().mockResolvedValue({ success: true }),
        signOut: jest.fn().mockResolvedValue({ success: true }),
        useSession: jest.fn().mockReturnValue({ data: null, isLoading: false }),
        onAuthStateChange: jest.fn()
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      const { authClient } = require('../src/lib/auth-client');
      
      // Verify it has methods commonly used in React components
      expect(typeof authClient.signIn).toBe('function');
      expect(typeof authClient.signOut).toBe('function');
      expect(typeof authClient.useSession).toBe('function');
      
      // Test that methods can be bound to event handlers without throwing
      expect(() => {
        const handleSignIn = authClient.signIn;
        const handleSignOut = authClient.signOut;
      }).not.toThrow();
    });

    it('should handle concurrent React component mounting', () => {
      const mockAuthClientInstance = {
        signIn: jest.fn(),
        signOut: jest.fn(),
        useSession: jest.fn().mockReturnValue({ data: null, isLoading: false })
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      // Simulate multiple components importing the auth client simultaneously
      const importPromises = Array.from({ length: 10 }, () => 
        Promise.resolve(require('../src/lib/auth-client'))
      );
      
      return Promise.all(importPromises).then(results => {
        // All should reference the same client instance
        const firstClient = results[0].authClient;
        results.forEach(result => {
          expect(result.authClient).toBe(firstClient);
        });
        
        // createAuthClient should only be called once
        expect(mockCreateAuthClient).toHaveBeenCalledTimes(1);
      });
    });

    it('should support authentication state listeners', () => {
      const mockAuthClientInstance = {
        signIn: jest.fn(),
        signOut: jest.fn(),
        onAuthStateChange: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      const { authClient } = require('../src/lib/auth-client');
      
      // Test event listener functionality if available
      if (authClient.onAuthStateChange) {
        const mockCallback = jest.fn();
        authClient.onAuthStateChange(mockCallback);
        expect(mockAuthClientInstance.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
      }
    });
  });

  describe('performance and resource management', () => {
    it('should not create memory leaks through multiple imports', () => {
      const mockAuthClientInstance = {
        signIn: jest.fn(),
        signOut: jest.fn(),
        cleanup: jest.fn()
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      // Import and discard references multiple times
      for (let i = 0; i < 100; i++) {
        const { authClient } = require('../src/lib/auth-client');
        // Simulate some usage
        expect(authClient).toBeDefined();
      }
      
      // Should still only have called createAuthClient once
      expect(mockCreateAuthClient).toHaveBeenCalledTimes(1);
    });

    it('should maintain consistent performance across multiple accesses', () => {
      const mockAuthClientInstance = {
        signIn: jest.fn(),
        signOut: jest.fn()
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      const startTime = Date.now();
      
      // Multiple rapid imports
      for (let i = 0; i < 1000; i++) {
        const { authClient } = require('../src/lib/auth-client');
        expect(authClient).toBe(mockAuthClientInstance);
      }
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Should be very fast due to module caching
      expect(executionTime).toBeLessThan(100); // Less than 100ms for 1000 imports
      expect(mockCreateAuthClient).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid successive method calls efficiently', async () => {
      const mockAuthClientInstance = {
        signIn: jest.fn().mockResolvedValue({ success: true }),
        signOut: jest.fn().mockResolvedValue({ success: true }),
        getSession: jest.fn().mockResolvedValue({ user: null })
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      const { authClient } = require('../src/lib/auth-client');
      
      // Test rapid successive calls
      const promises = Array.from({ length: 50 }, () => authClient.getSession());
      
      const results = await Promise.all(promises);
      
      // All calls should complete successfully
      expect(results).toHaveLength(50);
      results.forEach(result => {
        expect(result).toEqual({ user: null });
      });
      
      expect(mockAuthClientInstance.getSession).toHaveBeenCalledTimes(50);
    });
  });

  describe('configuration and initialization edge cases', () => {
    it('should handle createAuthClient being called with default configuration', () => {
      const mockAuthClientInstance = {
        signIn: jest.fn(),
        signOut: jest.fn(),
        config: { baseUrl: 'default-url' }
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      const { authClient } = require('../src/lib/auth-client');
      
      expect(mockCreateAuthClient).toHaveBeenCalledWith();
      expect(authClient).toBe(mockAuthClientInstance);
    });

    it('should handle missing export gracefully', () => {
      // Mock createAuthClient to return an object without proper exports
      mockCreateAuthClient.mockReturnValue({});
      
      const authClientModule = require('../src/lib/auth-client');
      
      expect(authClientModule.authClient).toEqual({});
      expect(mockCreateAuthClient).toHaveBeenCalledTimes(1);
    });

    it('should validate the auth client is properly exported', () => {
      const mockAuthClientInstance = {
        signIn: jest.fn(),
        signOut: jest.fn(),
        signUp: jest.fn()
      };
      
      mockCreateAuthClient.mockReturnValue(mockAuthClientInstance);
      
      // Import using both destructuring and direct access
      const authClientModule = require('../src/lib/auth-client');
      const { authClient } = authClientModule;
      
      expect(authClientModule).toHaveProperty('authClient');
      expect(authClient).toBe(mockAuthClientInstance);
      expect(authClient).toHaveProperty('signIn');
      expect(authClient).toHaveProperty('signOut');
      expect(authClient).toHaveProperty('signUp');
    });
  });
});