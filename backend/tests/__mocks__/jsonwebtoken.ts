const sign = jest.fn(() => 'mock-token');
const verify = jest.fn(() => ({ valid: true }));
const decode = jest.fn(() => ({ sub: 'mock-user' }));

const jwt = { sign, verify, decode };

export default jwt;
export { sign, verify, decode };
