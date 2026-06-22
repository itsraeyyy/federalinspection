import { sanitizeError } from './errorUtils';

describe('sanitizeError', () => {
  it('should handle null or undefined errors gracefully', () => {
    expect(sanitizeError(null)).toBe('An unexpected error occurred.');
    expect(sanitizeError(undefined)).toBe('An unexpected error occurred.');
  });

  it('should mask invalid login credentials', () => {
    const error = new Error('GoTrueAdminError: Invalid login credentials');
    expect(sanitizeError(error)).toBe('The email or password you entered is incorrect. Please try again.');
  });

  it('should mask user already registered error', () => {
    const error = { message: 'AuthApiError: User already registered' };
    expect(sanitizeError(error)).toBe('An account with this email already exists.');
  });

  it('should mask general Auth/GoTrue errors', () => {
    const error = 'GoTrue error checking session';
    expect(sanitizeError(error)).toBe('We encountered an issue with authentication. Please try again.');
  });

  it('should mask database footprint', () => {
    const error = new Error('PostgREST error: relation does not exist');
    expect(sanitizeError(error)).toBe('We encountered a problem retrieving your data. Please try again later.');
  });

  it('should handle duplicate key errors', () => {
    const error = new Error('duplicate key value violates unique constraint');
    expect(sanitizeError(error)).toBe('This record already exists.');
  });

  it('should provide a fallback generic error for unknown issues', () => {
    const error = new Error('Type mismatch on unhandled variable');
    expect(sanitizeError(error)).toBe('Something went wrong. Our team has been notified and is looking into it.');
  });
});
