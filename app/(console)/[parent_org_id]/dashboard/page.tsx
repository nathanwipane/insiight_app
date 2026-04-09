// –––––––––– app/[parent_org_id]/dashboard/page.tsx ––––––––––
"use client";

import { useSession } from "next-auth/react";
import { User } from "@/constants/types";
import AgencyDashboard from "@/components/dashboard/variants/AgencyDashboard";
import BrandDashboard from "@/components/dashboard/variants/BrandDashboard";
import MediaOwnerDashboard from "@/components/dashboard/variants/MediaOwnerDashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user as User | undefined;
  const orgType = user?.org_type;

  if (status === "loading") return null;

  if (orgType === "media_agency") return <AgencyDashboard />;
  if (orgType === "brand_advertiser") return <BrandDashboard />;
  return <MediaOwnerDashboard />;
}
