export interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  subItems?: NavigationItem[];
}