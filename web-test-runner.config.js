import { esbuildPlugin } from '@web/dev-server-esbuild'

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,
  // axe-core is loaded with the page, not by the first accessibility check: loading it takes about
  // a second, which would otherwise count against that one test's timeout.
  testRunnerHtml: (testFramework) => `<!doctype html>
<html>
  <body>
    <script src="/node_modules/axe-core/axe.min.js"></script>
    <script type="module" src="${testFramework}"></script>
  </body>
</html>`,
  plugins: [esbuildPlugin({ ts: true, target: 'es2022', tsconfig: 'tsconfig.json' })],
}
