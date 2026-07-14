export interface UserWithMetadata {
  app_metadata?: Record<string, unknown>;
}

export function hasAdminRole(user: UserWithMetadata | null): boolean {
  return user?.app_metadata?.role === 'admin';
}
