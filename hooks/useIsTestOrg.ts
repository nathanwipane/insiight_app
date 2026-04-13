import { useParams } from "next/navigation";

export function useIsTestOrg() {
  const params = useParams();
  return params.parent_org_id === "test-org";
}
