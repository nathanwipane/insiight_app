// hooks/usePermissions.ts
import { useSession } from 'next-auth/react'
import { User, Role } from '@/constants/types'
import { useMemo } from 'react'

export const usePermissions = () => {
  const { data: session, status } = useSession()
  const user = session?.user as User

  // Memoize the permissions array to prevent unnecessary re-renders
  const permissions = useMemo(() => {
    return user?.permissions || []
  }, [user?.permissions])

  // Memoize permission check functions to prevent unnecessary re-renders
  const hasPermission = useMemo(() => {
    return (permission: string): boolean => {
      if (status === 'loading' || status === 'unauthenticated' || !permissions.length) {
        return false
      }
      return permissions.includes(permission)
    }
  }, [status, permissions])
  
  const hasAnyPermission = useMemo(() => {
    return (permissionsList: string[]): boolean => {
      if (status === 'loading' || status === 'unauthenticated' || !permissions.length) {
        return false
      }
      return permissionsList.some(permission => permissions.includes(permission))
    }
  }, [status, permissions])
  
  const hasAllPermissions = useMemo(() => {
    return (permissionsList: string[]): boolean => {
      if (status === 'loading' || status === 'unauthenticated' || !permissions.length) {
        return false
      }
      return permissionsList.every(permission => permissions.includes(permission))
    }
  }, [status, permissions])
  
  const isRole = useMemo(() => {
    return (roleName: string): boolean => {
      return user?.role?.name === roleName
    }
  }, [user?.role?.name])
  
  // Add a more specific loading state that only returns true when we're actually loading
  // and not when we're just unauthenticated
  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated' && !!user
  const hasPermissionsLoaded = isAuthenticated && permissions.length > 0
  
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
    permissions,
    role: user?.role,
    user: user,
    isLoading,
    isAuthenticated,
    hasPermissionsLoaded,
    status,
  }
}