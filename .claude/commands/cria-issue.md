---
description: Cria Issue no GitHub com análise de impacto e verificação RGPD/NIS2
allowed-tools: [Bash, Read]
model: sonnet
effort: high
---

# /cria-issue

Cria uma Issue no GitHub com análise de impacto, invariantes de arquitetura e verificação RGPD/NIS2.

## Argumentos

- `$ARGUMENTS`: descrição da funcionalidade ou bug (ex: `"tabela de documentos com filtros por estado"`) - opcional; no caso de omissão solicita neste momento uma descrição para criar a issue.

## Passos

1. Skill `escolhe-issue` em modo verificação de conflitos — listar issues abertas similares
2. **MCP `angular`** — fundamentar a issue com documentação e boas práticas:
   - `get_best_practices` + `search_documentation` com 1-2 queries temáticas (ex: `signal store`, `HttpClient`, `lazy loadComponent`)
   - Objetivo: detetar invariantes técnicas e riscos reais antes de escrever o body
3. Analisar impacto:
    - Conflitos com issues existentes?
    - `docs/system_spec/*.md` afetados?
    - Novos componentes, stores, services, rotas ou features?
    - **Contrato:** a issue consome rotas/models/enums que ainda não existem no `openapi.yaml` do backend? Se sim, é dependência backend-first (ver passo 5).
    - Dependências de outras issues?
4. Verificar invariantes de arquitetura (ver skill `escreve-spec` — seção "Verificação de arquitetura")
5. **Verificação de contrato (backend-first):** se a issue precisa de rota/model/enum/envelope novo da API,
   o contrato tem de ser preparado **primeiro** no backend Laravel. O Angular nunca inventa contrato — só o
   consome via `sincroniza-contrato`. Se faltar, sinalizar a dependência cross-repo no body da issue.
6. Verificar RGPD/NIS2 (dados pessoais, nova superfície de ataque, ficheiros, logs)
7. Gerar body da issue e propor ao utilizador:
    ```
    📋 Issue proposta:
    Título: <type>: <descrição>
    Labels: type:<t>, stack:<s>, scope:<sc>, prio:<p>
    [body completo]
    Criar? [s / edita / cancela]
    ```
8. Se `s` → executar:
    ```bash
    gh issue create --repo $GITHUB_REPO --title "..." --body "..." --label "..." --milestone "..."
    ```
9. Detetar impacto cross-repo — se existir, propor issues linked nos repos afetados
10. Mostrar output:
    ```
    ✅ Issue #N criada
    URL: <url>
    Próximo: /planeia-issue #N
    ```

## Formato do body da issue

```markdown
## Contexto

[Porquê esta issue existe — o problema, não a solução]

## Critérios de aceitação

- [ ] CA-01: ...

## Impacto técnico

- Afeta: [camadas/features]
- SYSTEM_SPEC a atualizar: [docs/system_spec/...]
- Dependências: [#N | "nenhuma"]

## Invariantes em risco

[Lista ou "nenhum"]

## Contrato da API (consumo)

- Consome rota/model/enum novo do backend: [sim → detalhe + já existe no openapi.yaml? | não]
- Dependência backend-first: [sim → issue no repo Laravel | não]

## Verificação RGPD/NIS2

- Dados pessoais: [sim — detalhe | não]
- Superfície de ataque: [alterada — detalhe | inalterada]

## Fora de âmbito

[O que NÃO será feito]
```

## Labels

| Label type | Quando                                   |
| ---------- | ---------------------------------------- |
| `feat`     | nova funcionalidade                      |
| `fix`      | correção de bug                         |
| `refactor` | refactoring sem mudança de comportamento |
| `docs`     | documentação                             |
| `chore`    | configuração, CI, dependências           |
