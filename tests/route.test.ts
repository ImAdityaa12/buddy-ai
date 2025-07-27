/**
 * Unit tests for Next.js authentication route handlers using better-auth
 * Testing framework: Jest (assumed based on Next.js project structure)
 */

import { NextRequest } from 'next/server';

// Mock the auth module before importing the route handlers
jest.mock('../../../../../auth', () => ({
  auth: {
    handler: jest.fn(),
    config: {
      baseURL: 'http://localhost:3000',
      database: {},
      emailAndPassword: { enabled: true },
    },
  },
}));

// Mock better-auth/next-js toNextJsHandler function
jest.mock('better-auth/next-js', () => ({
  toNextJsHandler: jest.fn(),
}));

describe('Authentication Route Handlers', () => {
  let mockToNextJsHandler: jest.MockedFunction<any>;
  let mockAuth: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mocked functions after clearing
    const betterAuth = require('better-auth/next-js');
    const authModule = require('../../../../../auth');
    
    mockToNextJsHandler = betterAuth.toNextJsHandler;
    mockAuth = authModule.auth;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Module Initialization', () => {
    it('should call toNextJsHandler with auth instance during module import', () => {
      const mockHandlers = { POST: jest.fn(), GET: jest.fn() };
      mockToNextJsHandler.mockReturnValue(mockHandlers);
      
      // Re-import the module to trigger initialization
      jest.resetModules();
      require('./route');
      
      expect(mockToNextJsHandler).toHaveBeenCalledWith(mockAuth);
      expect(mockToNextJsHandler).toHaveBeenCalledTimes(1);
    });

    it('should export POST and GET handlers as functions', () => {
      const mockPOST = jest.fn();
      const mockGET = jest.fn();
      mockToNextJsHandler.mockReturnValue({ POST: mockPOST, GET: mockGET });
      
      jest.resetModules();
      const { POST, GET } = require('./route');
      
      expect(POST).toBeDefined();
      expect(GET).toBeDefined();
      expect(typeof POST).toBe('function');
      expect(typeof GET).toBe('function');
      expect(POST).toBe(mockPOST);
      expect(GET).toBe(mockGET);
    });

    it('should only export POST and GET methods', () => {
      const mockHandlers = { POST: jest.fn(), GET: jest.fn() };
      mockToNextJsHandler.mockReturnValue(mockHandlers);
      
      jest.resetModules();
      const handlers = require('./route');
      
      const exportedKeys = Object.keys(handlers);
      expect(exportedKeys).toEqual(['POST', 'GET']);
      expect(exportedKeys).toHaveLength(2);
    });

    it('should destructure handlers correctly from toNextJsHandler return value', () => {
      const postHandler = jest.fn();
      const getHandler = jest.fn();
      const mockHandlers = { POST: postHandler, GET: getHandler };
      mockToNextJsHandler.mockReturnValue(mockHandlers);
      
      jest.resetModules();
      const { POST, GET } = require('./route');
      
      expect(POST).toBe(postHandler);
      expect(GET).toBe(getHandler);
    });
  });

  describe('POST Handler Functionality', () => {
    let mockPOSTHandler: jest.Mock;
    let POST: any;

    beforeEach(() => {
      mockPOSTHandler = jest.fn();
      mockToNextJsHandler.mockReturnValue({ POST: mockPOSTHandler, GET: jest.fn() });
      
      jest.resetModules();
      const handlers = require('./route');
      POST = handlers.POST;
    });

    it('should handle successful sign-in request', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'user@example.com', 
          password: 'securePassword123' 
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const successResponse = new Response(
        JSON.stringify({ 
          success: true, 
          user: { 
            id: 'user-123', 
            email: 'user@example.com',
            name: 'Test User'
          },
          session: {
            token: 'jwt-token-here',
            expiresAt: '2024-12-31T23:59:59Z'
          }
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      mockPOSTHandler.mockResolvedValue(successResponse);
      const result = await POST(mockRequest);

      expect(mockPOSTHandler).toHaveBeenCalledWith(mockRequest);
      expect(result.status).toBe(200);
      
      const responseData = await result.json();
      expect(responseData.success).toBe(true);
      expect(responseData.user).toBeDefined();
      expect(responseData.user.email).toBe('user@example.com');
      expect(responseData.session).toBeDefined();
    });

    it('should handle failed authentication with invalid credentials', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'invalid@example.com', 
          password: 'wrongPassword' 
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const errorResponse = new Response(
        JSON.stringify({ 
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
          code: 'INVALID_CREDENTIALS'
        }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      mockPOSTHandler.mockResolvedValue(errorResponse);
      const result = await POST(mockRequest);

      expect(result.status).toBe(401);
      
      const errorData = await result.json();
      expect(errorData.error).toBe('Invalid credentials');
      expect(errorData.code).toBe('INVALID_CREDENTIALS');
    });

    it('should handle sign-up request with new user creation', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/sign-up', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'newuser@example.com',
          password: 'newSecurePassword123',
          name: 'New User'
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const signupResponse = new Response(
        JSON.stringify({ 
          success: true,
          user: { 
            id: 'user-456', 
            email: 'newuser@example.com',
            name: 'New User'
          },
          message: 'Account created successfully'
        }), 
        { 
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      mockPOSTHandler.mockResolvedValue(signupResponse);
      const result = await POST(mockRequest);

      expect(result.status).toBe(201);
      
      const responseData = await result.json();
      expect(responseData.success).toBe(true);
      expect(responseData.user.email).toBe('newuser@example.com');
      expect(responseData.message).toBe('Account created successfully');
    });

    it('should handle password reset request', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'user@example.com'
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const resetResponse = new Response(
        JSON.stringify({ 
          success: true,
          message: 'Password reset email sent'
        }), 
        { status: 200 }
      );

      mockPOSTHandler.mockResolvedValue(resetResponse);
      const result = await POST(mockRequest);

      expect(result.status).toBe(200);
      
      const responseData = await result.json();
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Password reset email sent');
    });

    it('should handle sign-out request', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/sign-out', {
        method: 'POST',
        headers: { 
          'Authorization': 'Bearer valid-session-token',
          'Content-Type': 'application/json'
        },
      });

      const signoutResponse = new Response(
        JSON.stringify({ 
          success: true,
          message: 'Successfully signed out'
        }), 
        { status: 200 }
      );

      mockPOSTHandler.mockResolvedValue(signoutResponse);
      const result = await POST(mockRequest);

      expect(result.status).toBe(200);
      
      const responseData = await result.json();
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Successfully signed out');
    });

    it('should handle malformed JSON in request body', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/sign-in', {
        method: 'POST',
        body: 'invalid-json-{malformed',
        headers: { 'Content-Type': 'application/json' },
      });

      const badRequestResponse = new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        }), 
        { status: 400 }
      );

      mockPOSTHandler.mockResolvedValue(badRequestResponse);
      const result = await POST(mockRequest);

      expect(result.status).toBe(400);
      
      const errorData = await result.json();
      expect(errorData.error).toBe('Invalid JSON in request body');
      expect(errorData.code).toBe('INVALID_JSON');
    });

    it('should handle missing required fields validation', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'user@example.com'
          // missing password field
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const validationErrorResponse = new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          details: { password: 'Password is required' },
          code: 'VALIDATION_ERROR'
        }), 
        { status: 422 }
      );

      mockPOSTHandler.mockResolvedValue(validationErrorResponse);
      const result = await POST(mockRequest);

      expect(result.status).toBe(422);
      
      const errorData = await result.json();
      expect(errorData.error).toBe('Missing required fields');
      expect(errorData.details).toBeDefined();
      expect(errorData.code).toBe('VALIDATION_ERROR');
    });

    it('should handle duplicate email during sign-up', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/sign-up', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test User'
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const conflictResponse = new Response(
        JSON.stringify({ 
          error: 'Email already exists',
          message: 'An account with this email already exists',
          code: 'EMAIL_EXISTS'
        }), 
        { status: 409 }
      );

      mockPOSTHandler.mockResolvedValue(conflictResponse);
      const result = await POST(mockRequest);

      expect(result.status).toBe(409);
      
      const errorData = await result.json();
      expect(errorData.error).toBe('Email already exists');
      expect(errorData.code).toBe('EMAIL_EXISTS');
    });

    it('should handle weak password validation', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/sign-up', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'user@example.com',
          password: '123',
          name: 'Test User'
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const weakPasswordResponse = new Response(
        JSON.stringify({ 
          error: 'Password too weak',
          message: 'Password must be at least 8 characters long',
          code: 'WEAK_PASSWORD'
        }), 
        { status: 400 }
      );

      mockPOSTHandler.mockResolvedValue(weakPasswordResponse);
      const result = await POST(mockRequest);

      expect(result.status).toBe(400);
      
      const errorData = await result.json();
      expect(errorData.error).toBe('Password too weak');
      expect(errorData.code).toBe('WEAK_PASSWORD');
    });

    it('should handle server internal errors', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'user@example.com', 
          password: 'password123' 
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const serverErrorResponse = new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          message: 'Database connection failed',
          code: 'INTERNAL_ERROR'
        }), 
        { status: 500 }
      );

      mockPOSTHandler.mockResolvedValue(serverErrorResponse);
      const result = await POST(mockRequest);

      expect(result.status).toBe(500);
      
      const errorData = await result.json();
      expect(errorData.error).toBe('Internal server error');
      expect(errorData.code).toBe('INTERNAL_ERROR');
    });

    it('should handle rate limiting scenarios', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'user@example.com', 
          password: 'password123' 
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const rateLimitResponse = new Response(
        JSON.stringify({ 
          error: 'Too many requests',
          message: 'Rate limit exceeded. Try again later',
          code: 'RATE_LIMIT_EXCEEDED'
        }), 
        { 
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '300'
          }
        }
      );

      mockPOSTHandler.mockResolvedValue(rateLimitResponse);
      const result = await POST(mockRequest);

      expect(result.status).toBe(429);
      expect(result.headers.get('Retry-After')).toBe('300');
      
      const errorData = await result.json();
      expect(errorData.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should handle requests with missing Content-Type header', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ 
          email: 'user@example.com', 
          password: 'password123' 
        }),
        // Missing Content-Type header
      });

      const badRequestResponse = new Response(
        JSON.stringify({ 
          error: 'Content-Type header is required',
          code: 'MISSING_CONTENT_TYPE'
        }), 
        { status: 400 }
      );

      mockPOSTHandler.mockResolvedValue(badRequestResponse);
      const result = await POST(mockRequest);

      expect(result.status).toBe(400);
      
      const errorData = await result.json();
      expect(errorData.error).toBe('Content-Type header is required');
      expect(errorData.code).toBe('MISSING_CONTENT_TYPE');
    });

    it('should handle empty request body', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/sign-in', {
        method: 'POST',
        body: '',
        headers: { 'Content-Type': 'application/json' },
      });

      const emptyBodyResponse = new Response(
        JSON.stringify({ 
          error: 'Request body cannot be empty',
          code: 'EMPTY_BODY'
        }), 
        { status: 400 }
      );

      mockPOSTHandler.mockResolvedValue(emptyBodyResponse);
      const result = await POST(mockRequest);

      expect(result.status).toBe(400);
    });
  });

  describe('GET Handler Functionality', () => {
    let mockGETHandler: jest.Mock;
    let GET: any;

    beforeEach(() => {
      mockGETHandler = jest.fn();
      mockToNextJsHandler.mockReturnValue({ POST: jest.fn(), GET: mockGETHandler });
      
      jest.resetModules();
      const handlers = require('./route');
      GET = handlers.GET;
    });

    it('should handle session retrieval for authenticated user', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'GET',
        headers: { 
          'Authorization': 'Bearer valid-session-token',
          'Cookie': 'session=valid-session-id'
        },
      });

      const sessionResponse = new Response(
        JSON.stringify({ 
          user: { 
            id: 'user-123', 
            email: 'user@example.com', 
            name: 'Test User',
            role: 'user',
            createdAt: '2024-01-01T00:00:00Z'
          },
          session: {
            id: 'session-123',
            token: 'valid-session-token',
            expiresAt: '2024-12-31T23:59:59Z',
            createdAt: '2024-07-01T12:00:00Z'
          }
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      mockGETHandler.mockResolvedValue(sessionResponse);
      const result = await GET(mockRequest);

      expect(mockGETHandler).toHaveBeenCalledWith(mockRequest);
      expect(result.status).toBe(200);
      
      const responseData = await result.json();
      expect(responseData.user).toBeDefined();
      expect(responseData.user.id).toBe('user-123');
      expect(responseData.user.email).toBe('user@example.com');
      expect(responseData.session).toBeDefined();
      expect(responseData.session.token).toBe('valid-session-token');
    });

    it('should handle session retrieval for unauthenticated user', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'GET',
        // No authorization headers
      });

      const noSessionResponse = new Response(
        JSON.stringify({ 
          user: null, 
          session: null,
          authenticated: false
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      mockGETHandler.mockResolvedValue(noSessionResponse);
      const result = await GET(mockRequest);

      expect(result.status).toBe(200);
      
      const responseData = await result.json();
      expect(responseData.user).toBeNull();
      expect(responseData.session).toBeNull();
      expect(responseData.authenticated).toBe(false);
    });

    it('should handle invalid or expired session token', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'GET',
        headers: { 
          'Authorization': 'Bearer expired-or-invalid-token' 
        },
      });

      const unauthorizedResponse = new Response(
        JSON.stringify({ 
          error: 'Invalid or expired session token',
          message: 'Please sign in again',
          code: 'INVALID_SESSION'
        }), 
        { status: 401 }
      );

      mockGETHandler.mockResolvedValue(unauthorizedResponse);
      const result = await GET(mockRequest);

      expect(result.status).toBe(401);
      
      const errorData = await result.json();
      expect(errorData.error).toBe('Invalid or expired session token');
      expect(errorData.code).toBe('INVALID_SESSION');
    });

    it('should handle CSRF token requests', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/csrf', {
        method: 'GET',
      });

      const csrfResponse = new Response(
        JSON.stringify({ 
          csrfToken: 'csrf-token-abcd1234',
          expires: '2024-07-15T12:00:00Z'
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      mockGETHandler.mockResolvedValue(csrfResponse);
      const result = await GET(mockRequest);

      expect(result.status).toBe(200);
      
      const responseData = await result.json();
      expect(responseData.csrfToken).toBeDefined();
      expect(typeof responseData.csrfToken).toBe('string');
      expect(responseData.expires).toBeDefined();
    });

    it('should handle authentication providers list request', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/providers', {
        method: 'GET',
      });

      const providersResponse = new Response(
        JSON.stringify({ 
          providers: [
            { 
              id: 'google', 
              name: 'Google', 
              type: 'oauth',
              enabled: true,
              authorizationUrl: 'https://accounts.google.com/oauth/authorize'
            },
            { 
              id: 'github', 
              name: 'GitHub', 
              type: 'oauth',
              enabled: true,
              authorizationUrl: 'https://github.com/login/oauth/authorize'
            },
            { 
              id: 'credentials', 
              name: 'Email/Password', 
              type: 'credentials',
              enabled: true
            }
          ]
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      mockGETHandler.mockResolvedValue(providersResponse);
      const result = await GET(mockRequest);

      expect(result.status).toBe(200);
      
      const responseData = await result.json();
      expect(responseData.providers).toHaveLength(3);
      expect(responseData.providers[0].id).toBe('google');
      expect(responseData.providers[1].id).toBe('github');
      expect(responseData.providers[2].id).toBe('credentials');
    });

    it('should handle OAuth callback verification with successful authentication', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/callback/google?code=auth_code_xyz123&state=random_state', {
        method: 'GET',
      });

      const callbackResponse = new Response(
        JSON.stringify({ 
          success: true,
          user: { 
            id: 'user-789', 
            email: 'user@gmail.com',
            name: 'Google User',
            provider: 'google'
          },
          redirect: '/dashboard',
          session: {
            token: 'new-session-token',
            expiresAt: '2024-12-31T23:59:59Z'
          }
        }), 
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      mockGETHandler.mockResolvedValue(callbackResponse);
      const result = await GET(mockRequest);

      expect(result.status).toBe(200);
      
      const responseData = await result.json();
      expect(responseData.success).toBe(true);
      expect(responseData.user.provider).toBe('google');
      expect(responseData.redirect).toBe('/dashboard');
    });

    it('should handle failed OAuth callback', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/callback/google?error=access_denied', {
        method: 'GET',
      });

      const callbackErrorResponse = new Response(
        JSON.stringify({ 
          error: 'OAuth authentication failed',
          message: 'User denied access',
          code: 'OAUTH_ACCESS_DENIED'
        }), 
        { status: 400 }
      );

      mockGETHandler.mockResolvedValue(callbackErrorResponse);
      const result = await GET(mockRequest);

      expect(result.status).toBe(400);
      
      const errorData = await result.json();
      expect(errorData.error).toBe('OAuth authentication failed');
      expect(errorData.code).toBe('OAUTH_ACCESS_DENIED');
    });

    it('should handle user profile retrieval', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer valid-token' },
      });

      const profileResponse = new Response(
        JSON.stringify({ 
          id: 'user-123',
          email: 'user@example.com',
          name: 'John Doe',
          avatar: 'https://example.com/avatar.jpg',
          createdAt: '2024-01-01T00:00:00Z',
          lastLoginAt: '2024-07-15T10:30:00Z'
        }), 
        { status: 200 }
      );

      mockGETHandler.mockResolvedValue(profileResponse);
      const result = await GET(mockRequest);

      expect(result.status).toBe(200);
    });

    it('should handle server errors in GET requests', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'GET',
      });

      const serverErrorResponse = new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          message: 'Database query failed',
          code: 'DB_CONNECTION_ERROR'
        }), 
        { status: 500 }
      );

      mockGETHandler.mockResolvedValue(serverErrorResponse);
      const result = await GET(mockRequest);

      expect(result.status).toBe(500);
      
      const errorData = await result.json();
      expect(errorData.error).toBe('Internal server error');
      expect(errorData.code).toBe('DB_CONNECTION_ERROR');
    });

    it('should handle malformed authorization headers', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'GET',
        headers: { 
          'Authorization': 'InvalidFormat missing-bearer-prefix' 
        },
      });

      const badRequestResponse = new Response(
        JSON.stringify({ 
          error: 'Malformed authorization header',
          message: 'Authorization header must use Bearer format',
          code: 'INVALID_AUTH_HEADER'
        }), 
        { status: 400 }
      );

      mockGETHandler.mockResolvedValue(badRequestResponse);
      const result = await GET(mockRequest);

      expect(result.status).toBe(400);
      
      const errorData = await result.json();
      expect(errorData.error).toBe('Malformed authorization header');
      expect(errorData.code).toBe('INVALID_AUTH_HEADER');
    });

    it('should handle requests with query parameters', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/auth/callback/github?code=gh_code_123&state=csrf_state', {
        method: 'GET',
      });

      const callbackResponse = new Response(
        JSON.stringify({ 
          success: true,
          provider: 'github',
          user: { id: 'gh-user-456', login: 'testuser' }
        }), 
        { status: 200 }
      );

      mockGETHandler.mockResolvedValue(callbackResponse);
      const result = await GET(mockRequest);

      expect(result.status).toBe(200);
      expect(mockGETHandler).toHaveBeenCalledWith(mockRequest);
      
      // Verify URL and query parameters are preserved
      const calledRequest = mockGETHandler.mock.calls[0][0];
      expect(calledRequest.url).toContain('code=gh_code_123');
      expect(calledRequest.url).toContain('state=csrf_state');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle toNextJsHandler initialization failure', () => {
      mockToNextJsHandler.mockImplementation(() => {
        throw new Error('Better-auth handler initialization failed');
      });

      expect(() => {
        jest.resetModules();
        require('./route');
      }).toThrow('Better-auth handler initialization failed');
    });

    it('should handle missing auth instance', () => {
      // Mock auth as undefined
      jest.doMock('../../../../../auth', () => ({
        auth: undefined,
      }));

      mockToNextJsHandler.mockImplementation((authInstance) => {
        if (!authInstance) {
          throw new Error('Auth instance is required for toNextJsHandler');
        }
        return { POST: jest.fn(), GET: jest.fn() };
      });

      expect(() => {
        jest.resetModules();
        require('./route');  
      }).toThrow('Auth instance is required for toNextJsHandler');
    });

    it('should handle incomplete handler object from toNextJsHandler', () => {
      // Return only POST handler, missing GET
      mockToNextJsHandler.mockReturnValue({ POST: jest.fn() });

      jest.resetModules();
      const handlers = require('./route');

      expect(handlers.POST).toBeDefined();
      expect(handlers.GET).toBeUndefined();
    });

    it('should handle non-function handlers from toNextJsHandler', () => {
      mockToNextJsHandler.mockReturnValue({ 
        POST: 'not-a-function', 
        GET: 42 
      });

      jest.resetModules();
      const handlers = require('./route');

      expect(typeof handlers.POST).toBe('string');
      expect(typeof handlers.GET).toBe('number');
    });

    it('should handle null return value from toNextJsHandler', () => {
      mockToNextJsHandler.mockReturnValue(null);

      jest.resetModules();
      const handlers = require('./route');

      expect(handlers.POST).toBeUndefined();
      expect(handlers.GET).toBeUndefined();
    });

    it('should handle empty object return from toNextJsHandler', () => {
      mockToNextJsHandler.mockReturnValue({});

      jest.resetModules();
      const handlers = require('./route');

      expect(handlers.POST).toBeUndefined();
      expect(handlers.GET).toBeUndefined();
    });

    it('should handle auth instance with invalid configuration', () => {
      // Mock auth with invalid config
      jest.doMock('../../../../../auth', () => ({
        auth: {
          config: null, // Invalid config
        },
      }));

      mockToNextJsHandler.mockImplementation((authInstance) => {
        if (!authInstance.config) {
          throw new Error('Invalid auth configuration');
        }
        return { POST: jest.fn(), GET: jest.fn() };
      });

      expect(() => {
        jest.resetModules();
        require('./route');  
      }).toThrow('Invalid auth configuration');
    });
  });

  describe('Concurrency and Integration Scenarios', () => {
    it('should handle concurrent POST and GET requests', async () => {
      const mockPOST = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );
      const mockGET = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ user: null }), { status: 200 })
      );
      
      mockToNextJsHandler.mockReturnValue({ POST: mockPOST, GET: mockGET });

      jest.resetModules();
      const { POST, GET } = require('./route');

      const postRequest = new NextRequest('http://localhost:3000/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const getRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'GET',
      });

      // Execute both requests concurrently
      const [postResult, getResult] = await Promise.all([
        POST(postRequest),
        GET(getRequest)
      ]);

      expect(postResult.status).toBe(200);
      expect(getResult.status).toBe(200);
      expect(mockPOST).toHaveBeenCalledWith(postRequest);
      expect(mockGET).toHaveBeenCalledWith(getRequest);
    });

    it('should maintain handler consistency across multiple imports', () => {
      const mockHandlers = { POST: jest.fn(), GET: jest.fn() };
      mockToNextJsHandler.mockReturnValue(mockHandlers);

      jest.resetModules();
      const handlers1 = require('./route');
      const handlers2 = require('./route');

      // Should return the same handler references due to module caching
      expect(handlers1.POST).toBe(handlers2.POST);
      expect(handlers1.GET).toBe(handlers2.GET);
      expect(handlers1).toBe(handlers2);
    });

    it('should handle rapid successive requests to same handler', async () => {
      const mockPOST = jest.fn();
      mockToNextJsHandler.mockReturnValue({ POST: mockPOST, GET: jest.fn() });

      // Set up different responses for each call
      mockPOST
        .mockResolvedValueOnce(new Response('Response 1', { status: 200 }))
        .mockResolvedValueOnce(new Response('Response 2', { status: 200 }))
        .mockResolvedValueOnce(new Response('Response 3', { status: 200 }));

      jest.resetModules();
      const { POST } = require('./route');

      const requests = Array.from({ length: 3 }, (_, i) => 
        new NextRequest(`http://localhost:3000/api/auth/test${i}`, {
          method: 'POST',
          body: JSON.stringify({ test: i }),
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const results = await Promise.all(requests.map(req => POST(req)));

      expect(results).toHaveLength(3);
      expect(mockPOST).toHaveBeenCalledTimes(3);
      results.forEach(result => {
        expect(result.status).toBe(200);
      });
    });

    it('should preserve request context and headers in handler calls', async () => {
      const mockPOST = jest.fn().mockResolvedValue(new Response('OK', { status: 200 }));
      mockToNextJsHandler.mockReturnValue({ POST: mockPOST, GET: jest.fn() });

      jest.resetModules();
      const { POST } = require('./route');

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Test-Agent/1.0',
          'X-Forwarded-For': '192.168.1.100',
          'Accept': 'application/json',
          'Origin': 'https://myapp.example.com',
          'Referer': 'https://myapp.example.com/login'
        },
      });

      await POST(mockRequest);

      expect(mockPOST).toHaveBeenCalledWith(mockRequest);
      
      // Verify the request object passed to handler maintains its properties
      const calledRequest = mockPOST.mock.calls[0][0];
      expect(calledRequest.method).toBe('POST');
      expect(calledRequest.headers.get('Content-Type')).toBe('application/json');
      expect(calledRequest.headers.get('User-Agent')).toBe('Test-Agent/1.0');
      expect(calledRequest.headers.get('X-Forwarded-For')).toBe('192.168.1.100');
      expect(calledRequest.headers.get('Origin')).toBe('https://myapp.example.com');
      expect(calledRequest.headers.get('Referer')).toBe('https://myapp.example.com/login');
    });

    it('should handle requests with custom headers and maintain them', async () => {
      const mockGET = jest.fn().mockResolvedValue(new Response('OK', { status: 200 }));
      mockToNextJsHandler.mockReturnValue({ POST: jest.fn(), GET: mockGET });

      jest.resetModules();
      const { GET } = require('./route');

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'GET',
        headers: {
          'X-Custom-Header': 'custom-value-123',
          'X-API-Version': '2.0',
          'X-Client-ID': 'web-application',
          'X-Request-ID': 'req-abc-123',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
      });

      await GET(mockRequest);

      const calledRequest = mockGET.mock.calls[0][0];
      expect(calledRequest.headers.get('X-Custom-Header')).toBe('custom-value-123');
      expect(calledRequest.headers.get('X-API-Version')).toBe('2.0');
      expect(calledRequest.headers.get('X-Client-ID')).toBe('web-application');
      expect(calledRequest.headers.get('X-Request-ID')).toBe('req-abc-123');
      expect(calledRequest.headers.get('Accept-Language')).toBe('en-US,en;q=0.9');
      expect(calledRequest.headers.get('Cache-Control')).toBe('no-cache');
    });

    it('should handle mixed success and error responses in concurrent requests', async () => {
      const mockPOST = jest.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Failed' }), { status: 400 }));
      
      const mockGET = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ user: { id: '123' } }), { status: 200 })
      );
      
      mockToNextJsHandler.mockReturnValue({ POST: mockPOST, GET: mockGET });

      jest.resetModules();
      const { POST, GET } = require('./route');

      const successRequest = new NextRequest('http://localhost:3000/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email: 'valid@example.com', password: 'password123' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const failRequest = new NextRequest('http://localhost:3000/api/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email: 'invalid@example.com', password: 'wrong' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const sessionRequest = new NextRequest('http://localhost:3000/api/auth/session', {
        method: 'GET',
      });

      const [successResult, failResult, sessionResult] = await Promise.all([
        POST(successRequest),
        POST(failRequest),
        GET(sessionRequest)
      ]);

      expect(successResult.status).toBe(200);
      expect(failResult.status).toBe(400);
      expect(sessionResult.status).toBe(200);
      expect(mockPOST).toHaveBeenCalledTimes(2);
      expect(mockGET).toHaveBeenCalledTimes(1);
    });
  });
});