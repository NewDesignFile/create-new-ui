# New UI, CLI

New UI is a modern, semantic UI for building beautiful, accessible sites and apps. Thoughtfully made for makers, teams, and anyone who cares about great design.

#### Install

Run with npx

```bash
npx create-new-ui
```

Or install globally

```bash
npm install -g create-new-ui
```

> Note: To add New UI foundations to an existing project, use `npm i -D @new-ui/foundations`. This includes reset styles, colors, effects, spacings, and typography.

#### Usage

#### Set the theme
Set the theme by adding the `data-new-ui-theme` attribute to your HTML wrapper element, for example:

```html
<html data-new-ui-theme="light">
```

Available themes  | Value
:--- |:---
Light (Default) | `light`
Light warm | `light--warm`
Light cold | `light--cold`
Dark  (Default) | `dark`
Dark warm | `dark--warm`
Dark cold | `dark--cold`


#### Usage guide
- All classes associated with the New UI are prefixed with a global namespace followed by a hyphen: `nu-`
- In addition to a global namespace, we added prefixes to each class to make it more apparent what job that class is doing using BEM syntax.
    - `c-` for UI components.
    - `l-` for layout-related styles.
    - `u-` for utilities.
    - `is-` and `has-` for state-based classes.
    - `js-` for targeting JavaScript-specific functionality.

