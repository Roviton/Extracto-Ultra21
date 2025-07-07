import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LoadingAllLoads() {
  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px] mt-2" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-4 w-[250px] mt-2" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-[300px]" />
              <Skeleton className="h-9 w-[100px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="rounded-md border">
            <div className="p-4">
              <Skeleton className="h-8 w-full mb-4" />
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full mb-4" />
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
