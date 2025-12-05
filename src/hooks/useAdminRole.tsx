import { useSupabaseAuth } from './useSupabaseAuth';

export const useAdminRole = () => {
  const { profile, loading } = useSupabaseAuth();

  // Check if user is admin: role_id === 1 OR role_name === 'admin'
  const isAdmin = profile?.role_id === 1 || profile?.role_name === 'admin';

  return { isAdmin, loading, profile };
};
