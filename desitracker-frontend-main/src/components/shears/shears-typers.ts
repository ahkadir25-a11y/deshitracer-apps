export interface TModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface DropdownItem {
  id: string | number;
  label: string;
}
