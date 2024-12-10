(function(n,e){typeof exports=="object"&&typeof module<"u"?e(exports,require("path"),require("inquirer"),require("chalk"),require("commander"),require("fs-extra")):typeof define=="function"&&define.amd?define(["exports","path","inquirer","chalk","commander","fs-extra"],e):(n=typeof globalThis<"u"?globalThis:n||self,e(n.CreateNewUI={},n.path,n.inquirer,n.chalk,n.commander,n.fsExtra))})(this,function(n,e,l,a,m,h){"use strict";var p=typeof document<"u"?document.currentScript:null;const{ensureDirSync:c,writeFileSync:o,writeJsonSync:w}=h,y={colors:"@new-ui/colors@latest",effects:"@new-ui/effects@latest",reset:"@new-ui/reset@latest",spacings:"@new-ui/spacings@latest",typography:"@new-ui/typography@latest"};async function f(){console.log(a.blue("Create New UI"));const{projectName:i}=await l.prompt([{type:"input",name:"projectName",message:"What is your project name?",default:"new-ui-app"}]),{selectedDependencies:d}=await l.prompt([{type:"checkbox",name:"selectedDependencies",message:"Install New UI foundations:",choices:Object.keys(y).map(s=>({name:s,checked:!0}))}]),t=e.resolve(process.cwd(),i);c(t),process.chdir(t);const r=e.join(t,"src");c(r),c(e.join(r,"scss")),c(e.join(r,"css")),o(e.join(t,"index.html"),`<!DOCTYPE html>
<html lang="en" data-new-ui-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${i}</title>
    <link rel="stylesheet" href="/src/scss/main.scss">
</head>
<body>
    <div id="app">
        <h1>Welcome to ${i}</h1>
    </div>
    <script type="module" src="/src/main.js"><\/script>
</body>
</html>`),o(e.join(r,"main.js"),`
console.log('New UI app initialized');
`);const v={name:i,version:"0.0.1",description:"New UI app.",scripts:{dev:"vite",build:"vite build",preview:"vite preview"},dependencies:{},devDependencies:{vite:"latest","sass-embedded":"latest",...Object.fromEntries(d.map(s=>[`@new-ui/${s}`,"latest"]))}};w(e.join(t,"package.json"),v,{spaces:2}),o(e.join(t,"vite.config.js"),`import { defineConfig } from 'vite';
  
  export default defineConfig({
    plugins: [],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: \`${d.map((s,u)=>`@use '@new-ui/${s}' as ${s}_${u};`).join(`
`)}\`,
          includePaths: ['node_modules/@new-ui']
        }
      }
    }
  });
  `);const g=e.join(r,"scss","main.scss"),j=[...new Set(d)],b={colors:"colors",effects:"effects",reset:"reset",spacings:"spacings",typography:"typography"},I=j.map(s=>{const u=b[s]||s;return`@use '@new-ui/${s}' as ${u};`}).join(`
`);o(g,`${I}

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
`.trim()),o(e.join(t,"README.md"),`# ${i}
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
`.trim()),console.log(a.green("✓ Created successfully!")),console.log(a.blue(`cd ${i} && pnpm i`))}(typeof document>"u"&&typeof location>"u"?require("url").pathToFileURL(__filename).href:typeof document>"u"?location.href:p&&p.tagName.toUpperCase()==="SCRIPT"&&p.src||new URL("new.umd.js",document.baseURI).href)===`file://${process.argv[1]}`&&(m.program.name("create-new-ui").description("Create a New UI app").action(f),m.program.parse(process.argv)),n.createNewUI=f,Object.defineProperty(n,Symbol.toStringTag,{value:"Module"})});
