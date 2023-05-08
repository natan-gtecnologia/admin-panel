const layoutTypes = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  TWOCOLUMN: 'twocolumn',
} as const;
export type LayoutTypes = typeof layoutTypes[keyof typeof layoutTypes];

const layoutModeTypes = {
  LIGHTMODE: 'light',
  DARKMODE: 'dark',
} as const;
export type LayoutModeTypes =
  typeof layoutModeTypes[keyof typeof layoutModeTypes];

const leftSidebarTypes = {
  LIGHT: 'light',
  DARK: 'dark',
  GRADIENT: 'gradient',
  GRADIENT_2: 'gradient-2',
  GRADIENT_3: 'gradient-3',
  GRADIENT_4: 'gradient-4',
} as const;
export type LeftSidebarTypes =
  typeof leftSidebarTypes[keyof typeof leftSidebarTypes];

const layoutWidthTypes = {
  FLUID: 'lg',
  BOXED: 'boxed',
} as const;
export type LayoutWidthTypes =
  typeof layoutWidthTypes[keyof typeof layoutWidthTypes];

const layoutPositionTypes = {
  FIXED: 'fixed',
  SCROLLABLE: 'scrollable',
} as const;
export type LayoutPositionTypes =
  typeof layoutPositionTypes[keyof typeof layoutPositionTypes];

const topbarThemeTypes = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;
export type TopbarThemeTypes =
  typeof topbarThemeTypes[keyof typeof topbarThemeTypes];

const leftsidbarSizeTypes = {
  DEFAULT: 'lg',
  COMPACT: 'md',
  SMALLICON: 'sm',
  SMALLHOVER: 'sm-hover',
} as const;
export type LeftsidbarSizeTypes =
  typeof leftsidbarSizeTypes[keyof typeof leftsidbarSizeTypes];

const leftSidebarViewTypes = {
  DEFAULT: 'default',
  DETACHED: 'detached',
} as const;
export type LeftSidebarViewTypes =
  typeof leftSidebarViewTypes[keyof typeof leftSidebarViewTypes];

const leftSidebarImageTypes = {
  NONE: 'none',
  IMG1: 'img-1',
  IMG2: 'img-2',
  IMG3: 'img-3',
  IMG4: 'img-4',
} as const;
export type LeftSidebarImageTypes =
  typeof leftSidebarImageTypes[keyof typeof leftSidebarImageTypes];

const preloaderTypes = {
  ENABLE: 'enable',
  DISABLE: 'disable',
} as const;
export type PreloaderTypes = typeof preloaderTypes[keyof typeof preloaderTypes];

export {
  layoutTypes,
  layoutModeTypes,
  leftSidebarTypes,
  layoutWidthTypes,
  layoutPositionTypes,
  topbarThemeTypes,
  leftsidbarSizeTypes,
  leftSidebarViewTypes,
  leftSidebarImageTypes,
  preloaderTypes,
};
