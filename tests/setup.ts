// Global test setup

// Set timeout for tests that load models
beforeEach(() => {
    jest.setTimeout(30000);
});

// Clean up after tests
afterEach(() => {
    jest.clearAllTimers();
});

export {}; 