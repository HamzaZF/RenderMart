import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Setup test database or mock services
  console.log('Setting up test environment...');
});

afterAll(async () => {
  // Cleanup test resources
  console.log('Cleaning up test environment...');
});

// Global test utilities
global.testUtils = {
  // Add any global test utilities here
  generateTestUser: () => ({
    email: `test-${Date.now()}@example.com`,
    password: 'testpassword123'
  }),
  
  generateTestImage: () => ({
    imageUrl: 'https://example.com/test-image.jpg',
    price: '10.00',
    status: 'listed'
  })
}; 