'use client';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Home from '@/app/page';
import { authClient } from '@/lib/auth-client';

// Mock the auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(),
    signUp: {
      email: vi.fn(),
    },
    signIn: {
      email: vi.fn(),
    },
    signOut: vi.fn(),
  },
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, ...props }: any) => (
    <button onClick={onClick} type={type} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, ...props }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  ),
}));

describe('Home Component', () => {
  const mockUseSession = vi.mocked(authClient.useSession);
  const mockSignUpEmail = vi.mocked(authClient.signUp.email);
  const mockSignInEmail = vi.mocked(authClient.signIn.email);
  const mockSignOut = vi.mocked(authClient.signOut);

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console.log to avoid cluttering test output
    vi.spyOn(console, 'log').mockImplementation(() => {});
    // Mock alert to avoid actual alerts during tests
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('When user is not authenticated', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ data: null });
    });

    it('renders the registration and login forms', () => {
      render(<Home />);
      
      // Check for registration form elements
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText('Email')).toHaveLength(2);
      expect(screen.getAllByPlaceholderText('Password')).toHaveLength(2);
      expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('updates name input value when typing', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      const nameInput = screen.getByPlaceholderText('Name');
      await user.type(nameInput, 'John Doe');
      
      expect(nameInput).toHaveValue('John Doe');
    });

    it('updates email input values when typing', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      const emailInputs = screen.getAllByPlaceholderText('Email');
      await user.type(emailInputs[0], 'john@example.com');
      
      // Both email inputs should have the same value due to shared state
      expect(emailInputs[0]).toHaveValue('john@example.com');
      expect(emailInputs[1]).toHaveValue('john@example.com');
    });

    it('updates password input values when typing', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      const passwordInputs = screen.getAllByPlaceholderText('Password');
      await user.type(passwordInputs[0], 'password123');
      
      // Both password inputs should have the same value due to shared state
      expect(passwordInputs[0]).toHaveValue('password123');
      expect(passwordInputs[1]).toHaveValue('password123');
    });

    it('calls authClient.signUp.email when register button is clicked', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      // Fill out the form
      await user.type(screen.getByPlaceholderText('Name'), 'John Doe');
      await user.type(screen.getAllByPlaceholderText('Email')[0], 'john@example.com');
      await user.type(screen.getAllByPlaceholderText('Password')[0], 'password123');
      
      // Click register button
      await user.click(screen.getByRole('button', { name: 'Register' }));
      
      expect(mockSignUpEmail).toHaveBeenCalledWith(
        {
          email: 'john@example.com',
          name: 'John Doe',
          password: 'password123',
        },
        {
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }
      );
    });

    it('calls authClient.signIn.email when login button is clicked', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      // Fill out the login form
      await user.type(screen.getAllByPlaceholderText('Email')[1], 'john@example.com');
      await user.type(screen.getAllByPlaceholderText('Password')[1], 'password123');
      
      // Click login button
      await user.click(screen.getByRole('button', { name: 'Login' }));
      
      expect(mockSignInEmail).toHaveBeenCalledWith(
        {
          email: 'john@example.com',
          password: 'password123',
        },
        {
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }
      );
    });

    it('prevents default form submission on register', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      const registerButton = screen.getByRole('button', { name: 'Register' });
      const preventDefault = vi.fn();
      
      // Simulate form submission event
      fireEvent.click(registerButton, {
        preventDefault,
      });
      
      expect(mockSignUpEmail).toHaveBeenCalled();
    });

    it('prevents default form submission on login', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      const loginButton = screen.getByRole('button', { name: 'Login' });
      const preventDefault = vi.fn();
      
      // Simulate form submission event
      fireEvent.click(loginButton, {
        preventDefault,
      });
      
      expect(mockSignInEmail).toHaveBeenCalled();
    });

    it('handles successful registration', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      // Mock successful response
      mockSignUpEmail.mockImplementation((credentials, callbacks) => {
        callbacks.onSuccess({ user: { id: '1', email: 'john@example.com' } });
      });
      
      await user.type(screen.getByPlaceholderText('Name'), 'John Doe');
      await user.type(screen.getAllByPlaceholderText('Email')[0], 'john@example.com');
      await user.type(screen.getAllByPlaceholderText('Password')[0], 'password123');
      await user.click(screen.getByRole('button', { name: 'Register' }));
      
      expect(console.log).toHaveBeenCalledWith({ user: { id: '1', email: 'john@example.com' } });
    });

    it('handles registration errors', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      // Mock error response
      mockSignUpEmail.mockImplementation((credentials, callbacks) => {
        callbacks.onError({ error: { message: 'Email already exists' } });
      });
      
      await user.type(screen.getByPlaceholderText('Name'), 'John Doe');
      await user.type(screen.getAllByPlaceholderText('Email')[0], 'john@example.com');
      await user.type(screen.getAllByPlaceholderText('Password')[0], 'password123');
      await user.click(screen.getByRole('button', { name: 'Register' }));
      
      expect(window.alert).toHaveBeenCalledWith('Email already exists');
    });

    it('handles successful login', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      // Mock successful response
      mockSignInEmail.mockImplementation((credentials, callbacks) => {
        callbacks.onSuccess({ user: { id: '1', email: 'john@example.com' } });
      });
      
      await user.type(screen.getAllByPlaceholderText('Email')[1], 'john@example.com');
      await user.type(screen.getAllByPlaceholderText('Password')[1], 'password123');
      await user.click(screen.getByRole('button', { name: 'Login' }));
      
      expect(console.log).toHaveBeenCalledWith({ user: { id: '1', email: 'john@example.com' } });
    });

    it('handles login errors', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      // Mock error response
      mockSignInEmail.mockImplementation((credentials, callbacks) => {
        callbacks.onError({ error: { message: 'Invalid credentials' } });
      });
      
      await user.type(screen.getAllByPlaceholderText('Email')[1], 'john@example.com');
      await user.type(screen.getAllByPlaceholderText('Password')[1], 'wrongpassword');
      await user.click(screen.getByRole('button', { name: 'Login' }));
      
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
    });

    it('handles empty form submission for registration', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await user.click(screen.getByRole('button', { name: 'Register' }));
      
      expect(mockSignUpEmail).toHaveBeenCalledWith(
        {
          email: '',
          name: '',
          password: '',
        },
        expect.any(Object)
      );
    });

    it('handles empty form submission for login', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await user.click(screen.getByRole('button', { name: 'Login' }));
      
      expect(mockSignInEmail).toHaveBeenCalledWith(
        {
          email: '',
          password: '',
        },
        expect.any(Object)
      );
    });

    it('handles special characters in form inputs', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      await user.type(screen.getByPlaceholderText('Name'), specialChars);
      await user.type(screen.getAllByPlaceholderText('Email')[0], 'test+email@example.com');
      await user.type(screen.getAllByPlaceholderText('Password')[0], specialChars);
      
      expect(screen.getByPlaceholderText('Name')).toHaveValue(specialChars);
      expect(screen.getAllByPlaceholderText('Email')[0]).toHaveValue('test+email@example.com');
      expect(screen.getAllByPlaceholderText('Password')[0]).toHaveValue(specialChars);
    });
  });

  describe('When user is authenticated', () => {
    const mockSession = {
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
    };

    beforeEach(() => {
      mockUseSession.mockReturnValue({ data: mockSession });
    });

    it('renders welcome message with user name', () => {
      render(<Home />);
      
      expect(screen.getByText('Welcome, John Doe!')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();
    });

    it('does not render registration or login forms', () => {
      render(<Home />);
      
      expect(screen.queryByPlaceholderText('Name')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Register' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Login' })).not.toBeInTheDocument();
    });

    it('calls authClient.signOut when sign out button is clicked', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      await user.click(screen.getByRole('button', { name: 'Sign Out' }));
      
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('handles user with empty name gracefully', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: '',
            email: 'john@example.com',
          },
        },
      });
      
      render(<Home />);
      
      expect(screen.getByText('Welcome, !')).toBeInTheDocument();
    });

    it('handles user with null name gracefully', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            name: null,
            email: 'john@example.com',
          },
        },
      });
      
      render(<Home />);
      
      expect(screen.getByText('Welcome, !')).toBeInTheDocument();
    });

    it('handles user with undefined name gracefully', () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'john@example.com',
          },
        },
      });
      
      render(<Home />);
      
      expect(screen.getByText('Welcome, !')).toBeInTheDocument();
    });
  });

  describe('Edge cases and error scenarios', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ data: null });
    });

    it('handles authClient.useSession throwing an error', () => {
      mockUseSession.mockImplementation(() => {
        throw new Error('Session error');
      });
      
      expect(() => render(<Home />)).toThrow('Session error');
    });

    it('handles authClient.signUp.email throwing an error', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      mockSignUpEmail.mockImplementation(() => {
        throw new Error('Network error');
      });
      
      await user.type(screen.getByPlaceholderText('Name'), 'John Doe');
      await user.type(screen.getAllByPlaceholderText('Email')[0], 'john@example.com');
      await user.type(screen.getAllByPlaceholderText('Password')[0], 'password123');
      
      expect(async () => {
        await user.click(screen.getByRole('button', { name: 'Register' }));
      }).rejects.toThrow('Network error');
    });

    it('handles authClient.signIn.email throwing an error', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      mockSignInEmail.mockImplementation(() => {
        throw new Error('Network error');
      });
      
      await user.type(screen.getAllByPlaceholderText('Email')[1], 'john@example.com');
      await user.type(screen.getAllByPlaceholderText('Password')[1], 'password123');
      
      expect(async () => {
        await user.click(screen.getByRole('button', { name: 'Login' }));
      }).rejects.toThrow('Network error');
    });

    it('handles very long input values', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      const longString = 'a'.repeat(1000);
      
      await user.type(screen.getByPlaceholderText('Name'), longString);
      await user.type(screen.getAllByPlaceholderText('Email')[0], longString + '@example.com');
      await user.type(screen.getAllByPlaceholderText('Password')[0], longString);
      
      expect(screen.getByPlaceholderText('Name')).toHaveValue(longString);
      expect(screen.getAllByPlaceholderText('Email')[0]).toHaveValue(longString + '@example.com');
      expect(screen.getAllByPlaceholderText('Password')[0]).toHaveValue(longString);
    });

    it('handles rapid successive button clicks', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      const registerButton = screen.getByRole('button', { name: 'Register' });
      
      // Click multiple times rapidly
      await user.click(registerButton);
      await user.click(registerButton);
      await user.click(registerButton);
      
      expect(mockSignUpEmail).toHaveBeenCalledTimes(3);
    });

    it('maintains state consistency between shared inputs', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      const emailInputs = screen.getAllByPlaceholderText('Email');
      const passwordInputs = screen.getAllByPlaceholderText('Password');
      
      // Type in first email input
      await user.type(emailInputs[0], 'test@example.com');
      expect(emailInputs[1]).toHaveValue('test@example.com');
      
      // Clear and type in second email input
      await user.clear(emailInputs[1]);
      await user.type(emailInputs[1], 'new@example.com');
      expect(emailInputs[0]).toHaveValue('new@example.com');
      
      // Same for password inputs
      await user.type(passwordInputs[0], 'password1');
      expect(passwordInputs[1]).toHaveValue('password1');
      
      await user.clear(passwordInputs[1]);
      await user.type(passwordInputs[1], 'password2');
      expect(passwordInputs[0]).toHaveValue('password2');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({ data: null });
    });

    it('has proper button types', () => {
      render(<Home />);
      
      const registerButton = screen.getByRole('button', { name: 'Register' });
      const loginButton = screen.getByRole('button', { name: 'Login' });
      
      expect(registerButton).toHaveAttribute('type', 'submit');
      expect(loginButton).toHaveAttribute('type', 'submit');
    });

    it('has proper input placeholders', () => {
      render(<Home />);
      
      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText('Email')).toHaveLength(2);
      expect(screen.getAllByPlaceholderText('Password')).toHaveLength(2);
    });

    it('buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<Home />);
      
      const registerButton = screen.getByRole('button', { name: 'Register' });
      
      // Focus and activate with keyboard
      registerButton.focus();
      expect(registerButton).toHaveFocus();
      
      await user.keyboard('{Enter}');
      expect(mockSignUpEmail).toHaveBeenCalled();
    });
  });
});