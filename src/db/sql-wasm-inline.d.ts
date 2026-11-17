declare module "sql.js/dist/sql-wasm-inline.js" {
  import type { SqlJsConfig, SqlJsStatic } from "sql.js";

  const initSqlJs: (config?: SqlJsConfig) => Promise<SqlJsStatic>;
  // biome-ignore lint/style/noDefaultExport: o módulo UMD do sql.js expõe apenas o export padrão
  export default initSqlJs;
}
