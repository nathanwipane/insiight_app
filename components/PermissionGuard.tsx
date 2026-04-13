// components/PermissionGuard.tsx
import React from 'react'
import { usePermissions } from '@/hooks/usePermissions'

interface PermissionGuardProps {
  permissions: string | string[]
  requireAll?: boolean // If true, user must have ALL permissions. If false, user needs ANY permission
  fallback?: React.ReactNode
  children: React.ReactNode
  loading?: React.ReactNode
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions,
  requireAll = false,
  fallback = null,
  loading = null,
  children
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasPermissionsLoaded } = usePermissions()

  // Show loading state while permissions are being loaded
  if (!hasPermissionsLoaded) {
    return <>{loading}</>
  }

  const permissionsList = Array.isArray(permissions) ? permissions : [permissions]
  
  let hasAccess = false
  
  if (permissionsList.length === 1) {
    hasAccess = hasPermission(permissionsList[0])
  } else if (requireAll) {
    hasAccess = hasAllPermissions(permissionsList)
  } else {
    hasAccess = hasAnyPermission(permissionsList)
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

// Hook version for when you need the boolean value
export const usePermissionGuard = (
  permissions: string | string[],
  requireAll: boolean = false
) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasPermissionsLoaded } = usePermissions()

  if (!hasPermissionsLoaded) {
    return { hasAccess: false, isLoading: true }
  }

  const permissionsList = Array.isArray(permissions) ? permissions : [permissions]
  
  let hasAccess = false
  
  if (permissionsList.length === 1) {
    hasAccess = hasPermission(permissionsList[0])
  } else if (requireAll) {
    hasAccess = hasAllPermissions(permissionsList)
  } else {
    hasAccess = hasAnyPermission(permissionsList)
  }

  return { hasAccess, isLoading: false }
}

export default PermissionGuard