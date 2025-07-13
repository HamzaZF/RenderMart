import { vi } from 'vitest';

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_API_BASE_URL: 'http://localhost:3300/api',
  VITE_APP_NAME: 'RenderMart',
  MODE: 'test'
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Global test utilities
global.testUtils = {
  // Mock API responses
  mockApiResponse: (data, status = 200) => {
    return Promise.resolve({
      ok: status < 400,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data))
    });
  },
  
  // Mock API error
  mockApiError: (message = 'API Error', status = 500) => {
    return Promise.reject(new Error(message));
  },
  
  // Create test user
  createTestUser: () => ({
    id: 1,
    email: 'test@example.com',
    balance: 100.00
  }),
  
  // Create test image
  createTestImage: () => ({
    id: 1,
    imageUrl: 'https://example.com/test-image.jpg',
    price: '10.00',
    status: 'listed',
    userId: 1
  })
}; 