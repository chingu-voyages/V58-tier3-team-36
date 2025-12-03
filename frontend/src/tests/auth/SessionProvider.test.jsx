import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthSessionProvider from '@/components/SessionProvider';
import { SessionProvider } from 'next-auth/react';

// Mock NextAuth SessionProvider
jest.mock('next-auth/react', () => ({
  SessionProvider: jest.fn(({ children }) => <div data-testid="session-provider">{children}</div>),
}));

describe('AuthSessionProvider Component', () => {
  it('renders children wrapped in SessionProvider', () => {
    render(
      <AuthSessionProvider>
        <div>Test Child</div>
      </AuthSessionProvider>
    );

    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('passes through SessionProvider correctly', () => {
    render(
      <AuthSessionProvider>
        <div>Another Child</div>
      </AuthSessionProvider>
    );

    expect(SessionProvider).toHaveBeenCalled();
  });
});
