function createMock() {
  const mock = {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  return mock;
}

export default createMock;
