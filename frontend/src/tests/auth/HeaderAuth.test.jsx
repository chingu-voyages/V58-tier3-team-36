import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '@/components/header';
import { useSession, signOut } from 'next-auth/react';

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Next.js dependencies
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));
jest.mock('next/link', () => ({ children, href }) => <a href={href}>{children}</a>);
jest.mock('next/image', () => ({ src, alt }) => <img src={src} alt={alt} />);
jest.mock('@/components/navigation', () => () => <nav data-testid="nav-mock">Navigation</nav>);
jest.mock('lucide-react', () => ({
  Menu: () => <span data-testid="icon-menu">MenuIcon</span>,
  X: () => <span data-testid="icon-x">XIcon</span>,
}));

describe('Header Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows Sign In button when user is not authenticated', () => {
    useSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Header />);

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows user info and Sign Out button when authenticated', () => {
    useSession.mockReturnValue({
      data: {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          image: 'https://example.com/avatar.jpg',
        },
      },
      status: 'authenticated',
    });

    render(<Header />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByAltText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('calls signOut when Sign Out button is clicked', () => {
    useSession.mockReturnValue({
      data: {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
          image: 'https://example.com/avatar.jpg',
        },
      },
      status: 'authenticated',
    });

    render(<Header />);

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);

    expect(signOut).toHaveBeenCalled();
  });

  it('does not show user image if not provided', () => {
    useSession.mockReturnValue({
      data: {
        user: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          image: null,
        },
      },
      status: 'authenticated',
    });

    render(<Header />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByAltText('Jane Doe')).not.toBeInTheDocument();
  });

  it('shows loading state appropriately', () => {
    useSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<Header />);

    // When loading, it should still render but might not show auth elements
    expect(screen.getByAltText('Chingu Logo')).toBeInTheDocument();
  });
});
