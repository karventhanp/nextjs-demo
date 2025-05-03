export interface MenuItem {
  name: string;
  iconPath: string;
  iconActivePath: string;
  path: string;
  active: boolean;
  subPaths?: string[];
  activePaths?: string[];
}