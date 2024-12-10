#!/usr/bin/env node
import s from "path";
import l from "inquirer";
import p from "chalk";
import { program as m } from "commander";
import g from "fs-extra";
const { ensureDirSync: a, writeFileSync: o, writeJsonSync: v } = g, y = {
  colors: "@new-ui/colors@latest",
  effects: "@new-ui/effects@latest",
  reset: "@new-ui/reset@latest",
  spacings: "@new-ui/spacings@latest",
  typography: "@new-ui/typography@latest"
};
async function b() {
  console.log(p.blue("Create New UI"));
  const { projectName: n } = await l.prompt([
    {
      type: "input",
      name: "projectName",
      message: "What is your project name?",
      default: "new-ui-app"
    }
  ]), { selectedDependencies: r } = await l.prompt([
    {
      type: "checkbox",
      name: "selectedDependencies",
      message: "Install New UI foundations:",
      choices: Object.keys(y).map((e) => ({
        name: e,
        checked: !0
      }))
    }
  ]), t = s.resolve(process.cwd(), n);
  a(t), process.chdir(t);
  const i = s.join(t, "src");
  a(i), a(s.join(i, "scss")), a(s.join(i, "css")), o(s.join(t, "index.html"), `<!DOCTYPE html>
<html lang="en" data-new-ui-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${n}</title>
    <link rel="stylesheet" href="/src/scss/main.scss">
</head>
<body>
    <div id="app">
        <h1>Welcome to ${n}</h1>
    </div>
    <script type="module" src="/src/main.js"><\/script>
</body>
</html>`), o(s.join(i, "main.js"), `
console.log('New UI app initialized');
`);
  const d = {
    name: n,
    version: "0.0.1",
    description: "New UI app.",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies: {},
    devDependencies: {
      vite: "latest",
      "sass-embedded": "latest",
      ...Object.fromEntries(r.map((e) => [`@new-ui/${e}`, "latest"]))
    }
  };
  v(s.join(t, "package.json"), d, { spaces: 2 }), o(s.join(t, "vite.config.js"), `import { defineConfig } from 'vite';
  
  export default defineConfig({
    plugins: [],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: \`${r.map((e, c) => `@use '@new-ui/${e}' as ${e}_${c};`).join(`
`)}\`,
          includePaths: ['node_modules/@new-ui']
        }
      }
    }
  });
  `);
  const u = s.join(i, "scss", "main.scss"), h = [...new Set(r)], f = {
    colors: "colors",
    effects: "effects",
    reset: "reset",
    spacings: "spacings",
    typography: "typography"
  }, w = h.map((e) => {
    const c = f[e] || e;
    return `@use '@new-ui/${e}' as ${c};`;
  }).join(`
`);
  o(
    u,
    `${w}

:root {
  font-size: 16px;
}

body {
  background: var(--background);
  color: var(--text-primary);
  font-family: var(--system-ui);
  font-size: var(--desktop-body-xl);
  line-height: var(--lh-desktop-body-xl);
}
`.trim()
  ), o(s.join(t, "README.md"), `# ${n}
New UI app

## Getting Started
1. Install dependencies:
\`\`\`bash
pnpm i
\`\`\`

2. Run development server:
\`\`\`bash
pnpm run dev
\`\`\`

3. Build for production:
\`\`\`bash
pnpm run build
\`\`\`

4. Preview production build:
\`\`\`bash
pnpm run preview
\`\`\`
`.trim()), console.log(p.green("✓ Created successfully!")), console.log(p.blue(`cd ${n} && pnpm i`));
}
import.meta.url === `file://${process.argv[1]}` && (m.name("create-new-ui").description("Create a New UI app").action(b), m.parse(process.argv));
export {
  b as createNewUI
};
