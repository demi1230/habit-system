import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);

/**
 * Transpiles one TypeScript source file and evaluates it in a sandbox.
 * `modules` maps import specifiers (e.g. '@/lib/dates') to stand-ins.
 */
export function loadTsModule(path, { globals = {}, modules = {} } = {}) {
  const source = fs.readFileSync(path, 'utf8');
  const output = ts.transpileModule(source, {
    fileName: String(path),
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, {
    exports,
    require: (id) => modules[id] ?? require(id),
    ...globals,
  });
  return exports;
}
