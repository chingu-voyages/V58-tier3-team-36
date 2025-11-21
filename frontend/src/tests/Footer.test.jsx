import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '@/components/footer';

// Mock Next.js hooks and components that Footer relies on
jest.mock('lucide-react', () => ({
  Github: () => <svg data-testid="github-icon" />,
}));

describe('Footer Component', () => {
  it('renders copyright, team info, and GitHub link', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    
    // Check static text content
    expect(screen.getByText(`© ${currentYear} Chingu V58-tier3-team-36`)).toBeInTheDocument();
    
    // Check the GitHub link
    const githubLink = screen.getByRole('link', { name: /view team git/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/chingu-voyages/V58-tier3-team-36');
    
    // Check the icon mock
    expect(screen.getByTestId('github-icon')).toBeInTheDocument();
  });
});