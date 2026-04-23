export interface MenuElement {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

export interface MenuItem {
  label: string;
  elements: MenuElement[];
}
