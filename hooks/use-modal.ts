import { create } from "zustand"

export type ModalType = "enhancedNewLoad"

interface ModalData {
  load?: any
  data?: any
}

interface ModalStore {
  type: ModalType | null
  data: ModalData
  isOpen: boolean
  onOpen: (type: ModalType, data?: ModalData) => void
  onClose: () => void
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, isOpen: false, data: {} }),
}))

// Export a convenience function for opening modals
export const openModal = (type: ModalType, data?: ModalData) => {
  useModal.getState().onOpen(type, data)
}
