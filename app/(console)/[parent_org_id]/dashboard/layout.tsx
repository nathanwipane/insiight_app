// ––––––––– app/(console)/dashboard/layout.tsx –––––––––––––––––––––––––––––––––––
import { redirect } from "next/navigation";
import { auth } from "@/lib/authOptions";
import jwt from "jsonwebtoken";
import { User } from "@/constants/types";
import DashboardShell from "@/components/layout/DashboardShell";

// TODO Stage 2: import TourWrapper from "@/components/ProductTour/TourWrapper"
// TODO Stage 2: import WelcomeModalProvider from "@/components/Providers/WelcomModalProvider"
// TODO Stage 2: import DemoProvider, DemoAutoLogin, DemoCredentialsWrapper, DemoBanner
// TODO Stage 2: import PoweredByInsiight from "@/components/ui/PoweredByInsiight"

// TODO: port these providers from old project then uncomment
// import { ParentOrgProvider } from "@/components/Providers/ParentOrgProvider"
// import { FilterProvider } from "@/components/Providers/FilterProvider"
// import { CampaignDataProvider } from "@/components/Providers/CampaignDataProvider"
// import { CampaignPlannerProvider } from "@/components/Providers/PlannerProvider"
// import { AgencyPlannerProvider } from "@/components/Providers/AgencyPlannerProvider"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ parent_org_id: string }>;
}) {
  const { parent_org_id } = await params;
  const session = await auth();

  // ── No session → redirect to signin ──────────────────────────
  if (!session) {
    redirect("/signin");
  }

  // ── JWT verification + org check ─────────────────────────────
  const user = session.user as User;

  if (user.jwt) {
    try {
      const decoded = jwt.verify(
        user.jwt,
        process.env.JWT_SECRET as string
      ) as {
        email: string;
        parent_org_id: string;
        role_id: number;
        org_id: string;
        user_id: string;
        org_type: string;
        permissions: string[];
        iat: number;
        exp: number;
      };

      const currentTime = Math.floor(Date.now() / 1000);

      // Token expired or user trying to access wrong org
      if (decoded.exp < currentTime || decoded.parent_org_id !== parent_org_id) {
        console.error("JWT expired or org mismatch — redirecting to signin");
        redirect("/signin?expired=true");
      }

      if (process.env.NODE_ENV === "development") {
        console.log("JWT valid. Expires:", new Date(decoded.exp * 1000));
      }

    } catch (error) {
      console.error("JWT verification failed:", error);
      redirect("/signin?expired=true");
    }
  }

  // ── Shell ─────────────────────────────────────────────────────
return (
  <DashboardShell parentOrgId={parent_org_id}>
    {children}
  </DashboardShell>
);
}