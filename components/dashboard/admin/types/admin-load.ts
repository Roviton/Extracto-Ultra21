export interface AdminLoad {
  id: string
  loadNumber: string
  origin: string
  destination: string
  pickupDate: string
  deliveryDate: string
  status: string
  rate?: number
  distance?: number
  rpm?: number
  needsAttention: boolean
  dispatcher?: {
    id: string
    name: string
    avatar?: string
  }
  driver?: {
    id: string
    name: string
    avatar?: string
  }
  customer?: {
    id: string
    name: string
    contact?: string
  }
  adminComments?: AdminComment[]
  createdAt: string
  updatedAt: string
}

export interface AdminComment {
  id: string
  text: string
  priority: "low" | "medium" | "high"
  author: string
  createdAt: string
  notifyDispatcher: boolean
}
