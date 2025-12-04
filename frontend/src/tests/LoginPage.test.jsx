import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '@/app/login/page';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginPage Component', () => {
  let mockPush;

  beforeEach(() => {
    mockPush = jest.fn();
    useRouter.mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  it('renders login page with Google sign-in button', () => {
    useSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<LoginPage />);

    expect(screen.getByText('Welcome to Chingu Demographics')).toBeInTheDocument();
    expect(screen.getByText('Sign in with your Google account to continue')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('shows loading state while checking authentication', () => {
    useSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<LoginPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to home page if already authenticated', async () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Test User', email: 'test@example.com' } },
      status: 'authenticated',
    });

    render(<LoginPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('calls signIn when Google sign-in button is clicked', () => {
    useSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<LoginPage />);

    const signInButton = screen.getByRole('button', { name: /sign in with google/i });
    fireEvent.click(signInButton);

    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
  });
});
