// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    // src/app/contrato/ é totalmente GERADO a partir do contrato do backend
    // (openapi-typescript + scripts/gen-models.mjs). Não editar à mão e não lintar.
    // src/app/models/ (modelos à mão, só-Angular) NÃO é ignorado — é lintado normalmente.
    // Ver docs/system_spec/02-shared/contrato-api.md.
    ignores: ["src/app/contrato/**/*.ts"],
  },
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      // O bearer token da sessão só pode ser lido onde é anexado ao pedido HTTP.
      // Ancorado no nome distintivo `tokenParaAutorizacao` (ver o comentário
      // "NÃO RENOMEAR" em src/app/state/sessao-ativa.store.ts): ancorar em
      // `.token` colidiria com o desembrulhar de Token['data']['token'].
      // Barreira de análise estática — cai perante um eslint-disable; serve
      // para que a leitura indevida rebente o CI, não para a impedir.
      "no-restricted-syntax": [
        "error",
        {
          selector: 'MemberExpression[property.name="tokenParaAutorizacao"]',
          message:
            "Leitura do bearer token restrita a src/app/core/interceptors/**. Injeta o SessaoAtivaStore e usa estaAutenticado() se só precisas de saber se há sessão.",
        },
      ],
    },
  },
  {
    // Exceção à regra acima — tem de vir DEPOIS do bloco que a define (em flat
    // config vence o último a aplicar-se). Delimitada aos ficheiros concretos:
    // uma exceção a **/*.spec.ts deixaria qualquer teste ler o token e tornava
    // a regra decorativa.
    files: [
      "src/app/core/interceptors/**/*.ts",
      "src/app/state/sessao-ativa.store.spec.ts",
    ],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  },
]);
