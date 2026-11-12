// Envoltorio LOCAL del motor vivo de VForge (fuera de git). No se sube al repo.
import { createRequire } from "node:module";
import original from "./next.config.vforig.ts";
const require = createRequire(import.meta.url);
let conVivo = (c) => c;
try { ({ conVivo } = require("./.vf-vivo/vf-vivo-next.cjs")); } catch { /* sin capa, compila igual */ }
const config = typeof original === "function"
  ? async (...a) => conVivo(await original(...a))
  : conVivo(original);
export default config;
