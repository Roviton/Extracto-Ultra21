"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, Search, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

// Sample driver data
const initialDriversData = [
  {
    id: "D-1001",
    name: "John Smith",
    avatar: "/javascript-code.png",
    telegramHandle: "@johnsmith",
    whatsappNumber: "+15551234567",
    preferredMethod: "telegram",
    isActive: true,
  },
  {
    id: "D-1002",
    name: "Sarah Johnson",
    avatar: "/stylized-letters-sj.png",
    telegramHandle: "",
    whatsappNumber: "+15552345678",
    preferredMethod: "whatsapp",
    isActive: true,
  },
  {
    id: "D-1003",
    name: "Mike Williams",
    avatar: "/intertwined-letters.png",
    telegramHandle: "@mikewilliams",
    whatsappNumber: "",
    preferredMethod: "telegram",
    isActive: true,
  },
  {
    id: "D-1004",
    name: "Tom Davis",
    avatar: "/abstract-geometric-TD.png",
    telegramHandle: "",
    whatsappNumber: "",
    preferredMethod: "email",
    isActive: false,
  },
  {
    id: "D-1005",
    name: "Lisa Brown",
    avatar: "/stylized-letter-lb.png",
    telegramHandle: "@lisabrown",
    whatsappNumber: "+15554567890",
    preferredMethod: "telegram",
    isActive: true,
  },
  {
    id: "D-1006",
    name: "Robert Chen",
    avatar: "/remote-control-collection.png",
    telegramHandle: "",
    whatsappNumber: "+15555678901",
    preferredMethod: "whatsapp",
    isActive: true,
  },
  {
    id: "D-1007",
    name: "Maria Garcia",
    avatar: "/abstract-geometric-mg.png",
    telegramHandle: "@mariagarcia",
    whatsappNumber: "+15556789012",
    preferredMethod: "none",
    isActive: false,
  },
]

type Driver = (typeof initialDriversData)[0]

export function MessagingIntegrationSettings() {
  const [driversData, setDriversData] = useState<Driver[]>(initialDriversData)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingDriver, setEditingDriver] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Driver>>({})
  const { toast } = useToast()

  const filteredDrivers = driversData.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (driverId: string) => {
    const driver = driversData.find((d) => d.id === driverId)
    if (driver) {
      setEditValues({
        telegramHandle: driver.telegramHandle,
        whatsappNumber: driver.whatsappNumber,
        preferredMethod: driver.preferredMethod,
      })
      setEditingDriver(driverId)
    }
  }

  const handleSave = (driverId: string) => {
    setDriversData((prev) =>
      prev.map((driver) =>
        driver.id === driverId
          ? {
              ...driver,
              telegramHandle: editValues.telegramHandle ?? driver.telegramHandle,
              whatsappNumber: editValues.whatsappNumber ?? driver.whatsappNumber,
              preferredMethod: editValues.preferredMethod ?? driver.preferredMethod,
            }
          : driver,
      ),
    )
    setEditingDriver(null)
    setEditValues({})
    toast({
      title: "Settings saved",
      description: "Driver messaging preferences have been updated.",
    })
  }

  const handleCancel = () => {
    setEditingDriver(null)
    setEditValues({})
  }

  const handleInputChange = (field: keyof Driver, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleBulkSave = () => {
    toast({
      title: "Settings saved",
      description: "All driver messaging preferences have been updated.",
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium">Messaging Integration Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure messaging integration settings for each driver to enable seamless communication.
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search drivers..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleBulkSave}>Save All Changes</Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Driver</TableHead>
                <TableHead>Telegram Handle</TableHead>
                <TableHead>WhatsApp Number</TableHead>
                <TableHead>Preferred Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={driver.avatar || "/placeholder.svg"} alt={driver.name} />
                        <AvatarFallback>
                          {driver.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{driver.name}</div>
                        <div className="text-xs text-muted-foreground">{driver.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingDriver === driver.id ? (
                      <Input
                        value={editValues.telegramHandle ?? ""}
                        onChange={(e) => handleInputChange("telegramHandle", e.target.value)}
                        placeholder="@username"
                        className="h-8 w-full max-w-[180px]"
                      />
                    ) : (
                      <span className={cn(!driver.telegramHandle && "text-muted-foreground italic")}>
                        {driver.telegramHandle || "Not set"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingDriver === driver.id ? (
                      <Input
                        value={editValues.whatsappNumber ?? ""}
                        onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                        placeholder="+1234567890"
                        className="h-8 w-full max-w-[180px]"
                      />
                    ) : (
                      <span className={cn(!driver.whatsappNumber && "text-muted-foreground italic")}>
                        {driver.whatsappNumber || "Not set"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingDriver === driver.id ? (
                      <Select
                        value={editValues.preferredMethod}
                        onValueChange={(value) => handleInputChange("preferredMethod", value)}
                      >
                        <SelectTrigger className="h-8 w-[180px]">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="telegram">Telegram</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        variant={
                          driver.preferredMethod === "none"
                            ? "outline"
                            : driver.preferredMethod === "email"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {driver.preferredMethod.charAt(0).toUpperCase() + driver.preferredMethod.slice(1)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={driver.isActive ? "outline" : "secondary"}>
                      {driver.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {editingDriver === driver.id ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={handleCancel}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleSave(driver.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(driver.id)}>
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
