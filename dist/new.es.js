#!/usr/bin/env node
import s from "path";
import d from "inquirer";
import a from "chalk";
import { program as l } from "commander";
import g from "fs-extra";
const { ensureDirSync: r, writeFileSync: o, writeJsonSync: y } = g, v = {
  colors: "@new-ui/colors@latest",
  effects: "@new-ui/effects@latest",
  reset: "@new-ui/reset@latest",
  spacings: "@new-ui/spacings@latest",
  typography: "@new-ui/typography@latest"
};
async function b() {
  console.log(a.blue("Create New UI"));
  const { projectName: t } = await d.prompt([
    {
      type: "input",
      name: "projectName",
      message: "What is your project name?",
      default: "new-ui-app"
    }
  ]), { selectedDependencies: c } = await d.prompt([
    {
      type: "checkbox",
      name: "selectedDependencies",
      message: "Install New UI foundations:",
      choices: Object.keys(v).map((e) => ({
        name: e,
        checked: !0
      }))
    }
  ]), n = s.resolve(process.cwd(), t);
  r(n), process.chdir(n);
  const i = s.join(n, "src");
  r(i), r(s.join(i, "scss")), r(s.join(i, "css")), o(s.join(n, "index.html"), `<!DOCTYPE html>
<html lang="en" data-new-ui-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t}</title>
  <link rel="stylesheet" href="/src/scss/main.scss">
</head>
<body>
  <div id="app">
    <h1>Welcome to ${t}</h1>
  </div>
  <script type="module" src="/src/main.js"><\/script>
</body>
</html>`), o(s.join(i, "main.js"), `
console.log('New UI app initialized');
`);
  const m = {
    name: t,
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
      ...Object.fromEntries(c.map((e) => [`@new-ui/${e}`, "latest"]))
    }
  };
  y(s.join(n, "package.json"), m, { spaces: 2 }), o(s.join(n, "vite.config.js"), `import { defineConfig } from 'vite';
  
  export default defineConfig({
  plugins: [],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: \`${c.map((e, p) => `@use '@new-ui/${e}' as ${e}_${p};`).join(`
`)}\`,
        includePaths: ['node_modules/@new-ui']
      }
    }
  }
});`);
  const u = s.join(i, "scss", "main.scss"), h = [...new Set(c)], f = {
    colors: "colors",
    effects: "effects",
    reset: "reset",
    spacings: "spacings",
    typography: "typography"
  }, w = h.map((e) => {
    const p = f[e] || e;
    return `@use '@new-ui/${e}' as ${p};`;
  }).join(`
`);
  o(u, `${w}
:root {
  font-size: 16px;
}
body {
  background: var(--background);
  color: var(--text-primary);
  font-family: var(--system-ui);
  font-size: var(--desktop-body-xl);
  line-height: var(--lh-desktop-body-xl);
}`.trim()), o(s.join(n, "README.md"), `# ${t}
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
\`\`\``.trim()), console.log(a.green("✓ Created successfully!")), console.log(a.blue(`cd ${t} && pnpm i`));
}
import.meta.url === `file://${process.argv[1]}` && (l.name("create-new-ui").description("Create a New UI app").action(async () => {
  try {
    await b();
  } catch (t) {
    console.error(a.red("Error creating New UI app:"), t), process.exit(1);
  }
}), l.parse(process.argv));
