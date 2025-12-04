import '@testing-library/jest-dom'

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock GSAP
jest.mock('gsap', () => {
  const gsap = {
    registerPlugin: jest.fn(),
    matchMedia: jest.fn(() => ({
      add: jest.fn(),
      revert: jest.fn(),
    })),
    timeline: jest.fn(() => ({
      to: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
    })),
    to: jest.fn(),
    from: jest.fn(),
  }
  
  return {
    __esModule: true,
    default: gsap,
    gsap: gsap,
  }
})

jest.mock('gsap/ScrollTrigger', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    refresh: jest.fn(),
  },
  ScrollTrigger: {
    create: jest.fn(),
    refresh: jest.fn(),
  },
}))