/**
 * Project configuration interface
 */
export interface ProjectConfig {
  name: string;
  dependencies: string[];
  framework: string;
  bundler: string;
}

/**
 * Frameworks supported by the CLI
 */
export const FRAMEWORKS = {
  REACT: 'React',
  VUE: 'Vue',
  SVELTE: 'Svelte',
  NONE: 'None',
};

/**
 * Bundlers supported by the CLI
 */
export const BUNDLERS = {
  VITE: 'vite',
  RSPACK: 'rspack',
  NONE: 'None',
};

/**
 * New UI dependency options
 */
export const NEW_UI_DEPENDENCIES = [
  { value: 'reset', label: '@new-ui/reset' },
  { value: 'colors', label: '@new-ui/colors' },
  { value: 'spacings', label: '@new-ui/spacings' },
  { value: 'typography', label: '@new-ui/typography' },
  { value: 'effects', label: '@new-ui/effects' },
];

/**
 * Framework options for selection
 */
export const FRAMEWORK_OPTIONS = [
  { value: FRAMEWORKS.REACT, label: 'React' },
  { value: FRAMEWORKS.VUE, label: 'Vue' },
  { value: FRAMEWORKS.SVELTE, label: 'Svelte' },
  { value: FRAMEWORKS.NONE, label: 'None' },
];

/**
 * Bundler options for selection
 */
export const BUNDLER_OPTIONS = [
  { value: BUNDLERS.VITE, label: 'Vite' },
  { value: BUNDLERS.RSPACK, label: 'Rspack' },
  { value: BUNDLERS.NONE, label: 'None' },
];
