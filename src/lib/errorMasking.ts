export function maskSupabaseError(error: any): string {
  if (!error) return 'An unknown error occurred.';

  const rawMessage = (error.message || error.toString()).toLowerCase();

  // Intercept and mask infrastructure footprints
  if (
    rawMessage.includes('gotrue') ||
    rawMessage.includes('postgrest') ||
    rawMessage.includes('postgresql') ||
    rawMessage.includes('supabase') ||
    rawMessage.includes('database') ||
    rawMessage.includes('relation') ||
    rawMessage.includes('schema') ||
    rawMessage.includes('fetch')
  ) {
    // Some common user-facing errors that might get caught
    if (rawMessage.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (rawMessage.includes('user already registered')) {
      return 'An account with this email already exists.';
    }
    if (rawMessage.includes('rate limit')) {
      return 'Too many requests. Please try again later.';
    }

    return 'An unexpected error occurred while processing your request. Please try again later.';
  }

  // Common user-friendly auth errors from Supabase that don't need masking
  if (rawMessage.includes('invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  
  if (rawMessage.includes('user already registered')) {
    return 'An account with this email already exists.';
  }

  return error.message || 'An unexpected error occurred.';
}
