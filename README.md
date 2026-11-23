# Portal BI Logística

## Estrutura

- `scripts/build_menu.js`: leitura da planilha e geração do HTML.
- `assets/css/tokens.css`: variáveis globais do design system.
- `assets/css/layout.css`: estrutura geral da página.
- `assets/css/components.css`: componentes reutilizáveis.
- `assets/js/portal.js`: filtros, busca e interação da sidebar.
- `data/`: fontes de dados usadas pelo gerador.
- `portal.html`: arquivo gerado. Não editar diretamente.

## Uso

```powershell
npm install
npm run build
npm run serve
```

## Formatação

```powershell
npm run format
npm run format:check
```

O arquivo `.prettierrc.json` define a configuração do projeto. O VS Code está configurado para formatar arquivos suportados automaticamente ao salvar.
