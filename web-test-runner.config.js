import { esbuildPlugin } from '@web/dev-server-esbuild'

export default {
  files: 'src/**/*.test.ts',
  nodeResolve: true,
  // One page at a time: a test that resizes the viewport (setViewport) stalls in a page the
  // browser has in the background, and the breakpoint tests need a real window width.
  concurrency: 1,
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
