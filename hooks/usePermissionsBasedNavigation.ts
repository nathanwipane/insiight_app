// –––––––––– hooks/usePermissionsBasedNavigation.ts ––––––––––
import { useMemo } from 'react'
import { usePermissions } from './usePermissions'
import { PERMISSIONS } from '@/constants/config'
import { Calendar, Group, Megaphone, MapPin, Settings } from 'lucide-react'

export const usePermissionsBasedNavigation = (parentOrgId: string, orgType: string) => {
  const { hasPermission, hasPermissionsLoaded, permissions } = usePermissions()

  const campaignItems = useMemo(() => {
    if (!hasPermissionsLoaded || !parentOrgId) {
      return []
    }

    const items: { title: string; href: string; icon: any }[] = []

    if (hasPermission(PERMISSIONS.CAMPAIGNS_VIEW)) {
      items.push({
        title: "Manage Campaigns",
        href: `/${parentOrgId}/dashboard/campaigns`,
        icon: Megaphone,
      })
    }

    if (hasPermission(PERMISSIONS.PLANS_VIEW)) {
      items.push({
        title: "Plans",
        href: `/${parentOrgId}/dashboard/plans`,
        icon: Calendar,
      })
    }

    if (hasPermission(PERMISSIONS.AUDIENCE_PLAN_VIEW)) {
      items.push({
        title: "Audience Finder (Beta)",
        href: `/${parentOrgId}/dashboard/audience-finder`,
        icon: Group,
      })
    }

    if (hasPermission(PERMISSIONS.ASSETS_VIEW)) {
      items.push({
        title: "Assets",
        href: `/${parentOrgId}/dashboard/assets`,
        icon: MapPin,
      })
    }

    if (hasPermission(PERMISSIONS.ORG_VIEW)) {
      items.push({
        title: "Settings",
        href: `/${parentOrgId}/dashboard/settings`,
        icon: Settings,
      })
    }

    return items
  }, [parentOrgId, orgType, hasPermissionsLoaded, hasPermission, permissions])

  const hasCampaignAccess = useMemo(() => {
    if (!hasPermissionsLoaded) return false
    return hasPermission(PERMISSIONS.CAMPAIGNS_VIEW) || hasPermission(PERMISSIONS.PLANS_VIEW)
  }, [hasPermission, hasPermissionsLoaded])

  const hasAssetsAccess = useMemo(() => {
    if (!hasPermissionsLoaded) return false
    return hasPermission(PERMISSIONS.ASSETS_VIEW)
  }, [hasPermission, hasPermissionsLoaded])

  const hasTeamAccess = useMemo(() => {
    if (!hasPermissionsLoaded) return false
    return hasPermission(PERMISSIONS.TEAM_VIEW) || hasPermission(PERMISSIONS.TEAM_ADD_REMOVE)
  }, [hasPermission, hasPermissionsLoaded])

  const hasOrgAccess = useMemo(() => {
    if (!hasPermissionsLoaded) return false
    return hasPermission(PERMISSIONS.ORG_VIEW)
  }, [hasPermission, hasPermissionsLoaded])

  return {
    campaignItems,
    hasCampaignAccess,
    hasAssetsAccess,
    hasTeamAccess,
    hasOrgAccess,
    hasPermissionsLoaded,
  }
}
