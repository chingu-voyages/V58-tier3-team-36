import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '@/components/header';

// Mock Next.js hooks and components that Header relies on
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));
jest.mock('next/image', () => ( props ) => <img {...props} />);
jest.mock('@/components/navigation', () => () => <nav data-testid="nav-mock">Navigation</nav>);

// Define accessible names for the toggle buttons
const OPEN_MENU_NAME = /open navigation menu/i; 
const CLOSE_MENU_NAME = /close navigation menu/i;

describe('Header Component', () => {
  it('renders the application name, logo, and mock components', () => {
    render(<Header />);
    
    // Check main static elements
    expect(screen.getByText('Demographics Explorer')).toBeInTheDocument();
    expect(screen.getByAltText('Chingu Logo')).toBeInTheDocument();
    const navMocks = screen.queryAllByTestId('nav-mock');
    expect(navMocks).toHaveLength(2);
  });
  
  it('toggles the mobile menu on button click', () => {
    render(<Header />);
    
    const menuButton = screen.getByRole('button', { name: OPEN_MENU_NAME });
    fireEvent.click(menuButton);
    const closeButton = screen.getByRole('button', { name: CLOSE_MENU_NAME });
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);
    expect(screen.getByRole('button', { name: OPEN_MENU_NAME })).toBeInTheDocument(); 
  });
});