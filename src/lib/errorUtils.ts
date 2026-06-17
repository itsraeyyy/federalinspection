export function sanitizeError(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  
  const msg = error.message || error.toString();
  const lowerMsg = msg.toLowerCase();

  // Handle Auth specific errors and mask "GoTrue"
  if (lowerMsg.includes('gotrue') || lowerMsg.includes('auth') || lowerMsg.includes('invalid credentials')) {
    if (lowerMsg.includes('invalid login credentials')) {
      return 'The email or password you entered is incorrect. Please try again.';
    }
    if (lowerMsg.includes('user already registered')) {
      return 'An account with this email already exists.';
    }
    return 'We encountered an issue with authentication. Please try again.';
  }

  // Handle Database/PostgREST specific errors and mask infrastructure footprint
  if (lowerMsg.includes('postgrest') || lowerMsg.includes('postgresql') || lowerMsg.includes('database error')) {
    return 'We encountered a problem retrieving your data. Please try again later.';
  }

  if (lowerMsg.includes('duplicate key value')) {
    return 'This record already exists.';
  }

  // Fallback generic error
  return 'Something went wrong. Our team has been notified and is looking into it.';
}
