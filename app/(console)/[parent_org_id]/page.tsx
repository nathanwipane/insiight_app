"use client"
import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function ParentOrgPage() {
  const router = useRouter()
  const params = useParams()
  const parent_org_id = params.parent_org_id as string

  useEffect(() => {
    router.replace(`/${parent_org_id}/dashboard`)
  }, [router, parent_org_id])

  return null
}