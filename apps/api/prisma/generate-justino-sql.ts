import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildJustinoMissingCodes } from "./justino-missing-data.js";

const USER_ID = "5e0cae63-da17-444e-b3e6-fcde8017228d";
const codes = buildJustinoMissingCodes();
const values = codes.map((code) => `  ('${code}')`).join(",\n");

const repeatedValues = ["CRO2", "CRO3", "PAR5", "PAN1", "CUW5", "MEX11"]
  .map((code) => `  ('${code}')`)
  .join(",\n");

const sql = `-- Importar álbum de @justino en Supabase SQL Editor
-- Usuario: ${USER_ID}

-- ============================================================
-- 1) FALTANTES (${codes.length} figuritas)
-- Preserva las que ya tengan quantityRepeated > 0
-- ============================================================

BEGIN;

WITH missing_codes(code) AS (
  VALUES
${values}
),
target_user AS (
  SELECT '${USER_ID}'::text AS id
)
INSERT INTO "UserSticker" (id, "userId", "stickerId", "quantityOwned", "quantityRepeated")
SELECT
  gen_random_uuid(),
  tu.id,
  s.id,
  0,
  0
FROM missing_codes mc
JOIN "Sticker" s ON s.code = mc.code
CROSS JOIN target_user tu
LEFT JOIN "UserSticker" us ON us."userId" = tu.id AND us."stickerId" = s.id
WHERE COALESCE(us."quantityRepeated", 0) = 0
ON CONFLICT ("userId", "stickerId") DO UPDATE
SET
  "quantityOwned" = EXCLUDED."quantityOwned",
  "quantityRepeated" = EXCLUDED."quantityRepeated"
WHERE "UserSticker"."quantityRepeated" = 0;

COMMIT;

-- ============================================================
-- 2) PEGADAS (todo lo que NO está en faltantes)
-- Necesario para que el resumen muestre ~547 faltantes y ~45% completitud
-- ============================================================

BEGIN;

WITH missing_codes(code) AS (
  VALUES
${values}
),
target_user AS (
  SELECT '${USER_ID}'::text AS id
)
INSERT INTO "UserSticker" (id, "userId", "stickerId", "quantityOwned", "quantityRepeated")
SELECT
  gen_random_uuid(),
  tu.id,
  s.id,
  1,
  0
FROM "Sticker" s
CROSS JOIN target_user tu
WHERE s.code NOT IN (SELECT code FROM missing_codes)
ON CONFLICT ("userId", "stickerId") DO UPDATE
SET
  "quantityOwned" = GREATEST("UserSticker"."quantityOwned", 1),
  "quantityRepeated" = "UserSticker"."quantityRepeated";

COMMIT;

-- ============================================================
-- 3) REPETIDAS (6 figuritas) — por si faltan
-- ============================================================

/*
BEGIN;

WITH repeated_codes(code) AS (
  VALUES
${repeatedValues}
),
target_user AS (
  SELECT '${USER_ID}'::text AS id
)
INSERT INTO "UserSticker" (id, "userId", "stickerId", "quantityOwned", "quantityRepeated")
SELECT
  gen_random_uuid(),
  tu.id,
  s.id,
  1,
  1
FROM repeated_codes rc
JOIN "Sticker" s ON s.code = rc.code
CROSS JOIN target_user tu
ON CONFLICT ("userId", "stickerId") DO UPDATE
SET
  "quantityOwned" = GREATEST("UserSticker"."quantityOwned", 1),
  "quantityRepeated" = GREATEST("UserSticker"."quantityRepeated", 1);

COMMIT;
*/

-- ============================================================
-- 4) VERIFICACIÓN
-- ============================================================

SELECT COUNT(*) AS faltantes_trackeadas
FROM "UserSticker" us
JOIN "Sticker" s ON s.id = us."stickerId"
WHERE us."userId" = '${USER_ID}'
  AND us."quantityOwned" = 0
  AND us."quantityRepeated" = 0;

SELECT COUNT(*) AS pegadas_trackeadas
FROM "UserSticker" us
WHERE us."userId" = '${USER_ID}'
  AND us."quantityOwned" > 0
  AND us."quantityRepeated" = 0;

SELECT COUNT(*) AS repetidas_trackeadas
FROM "UserSticker" us
WHERE us."userId" = '${USER_ID}'
  AND us."quantityRepeated" > 0;

SELECT
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE us."quantityOwned" > 0) / NULLIF((SELECT COUNT(*) FROM "Sticker"), 0),
    2
  ) AS completitud_porcentaje
FROM "UserSticker" us
WHERE us."userId" = '${USER_ID}';
`;

const outputPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "import-justino-missing.sql");
writeFileSync(outputPath, sql);
console.log(`Generado: ${outputPath}`);
console.log(`Faltantes: ${codes.length} códigos`);
