import { DispatcherProfile } from "@/components/dashboard/admin/dispatcher-profile"

export default function DispatcherProfilePage({ params }: { params: { id: string } }) {
  return <DispatcherProfile dispatcherId={params.id} />
}
