import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '@/components/navigation';

// Mock Next.js hooks and components that navigation relies on
const mockPathname = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));
jest.mock('next/link', () => {
    // Mock Link to render as a simple anchor tag for testing
    return ({ children, href }) => <a href={href}>{children}</a>;
});


describe('Navigation Component', () => {
  beforeEach(() => {
    // Default path for most tests
    mockPathname.mockReturnValue('/');
  });

  it('renders all three main navigation links', () => {
    render(<Navigation />);

    expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /map/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /list/i })).toBeInTheDocument();
  });

  it('correctly sets the active style on the "Home" link when on root path', () => {
    mockPathname.mockReturnValue('/');
    render(<Navigation />);
    
    const homeLink = screen.getByRole('button', { name: /home/i });
    const mapLink = screen.getByRole('button', { name: /map/i });

    expect(homeLink).toHaveClass('bg-brand-mint/60');
    expect(mapLink).toHaveClass('text-brand-textGrey');
  });
  
  it('correctly sets the active style on the "List" link when on /list path', () => {
    mockPathname.mockReturnValue('/list');
    render(<Navigation />);
    
    const listLink = screen.getByRole('button', { name: /list/i });
    
    // Assert active state styles
    expect(listLink).toHaveClass('bg-brand-mint/60');
    expect(listLink).toHaveClass('text-brand-blue');

    // Assert inactive state styles
    const homeLink = screen.getByRole('button', { name: /home/i });
    expect(homeLink).toHaveClass('text-brand-textGrey');
  });
});