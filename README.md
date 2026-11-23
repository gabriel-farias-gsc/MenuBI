# Portal BI Logística

## Estrutura

- `web/`: página gerada e código do front-end.
- `api/`: gerador do portal e planilha de origem em `api/data/`.
- `assets/`: estilos e logo compartilhados pela aplicação.
- `package.json`: comandos do monorepo.
- `web/package.json`: dependências e ferramentas do front-end.

## Uso

```powershell
npm --prefix web install
npm run build
npm run serve
```

O build gera `web/index.html`. Com o servidor iniciado na raiz do projeto, acesse
`http://localhost:3000/web/`.

## Formatação

```powershell
npm run format
npm run format:check
```

A configuração do Prettier fica em `web/.prettierrc.json`. O VS Code está configurado para formatar arquivos suportados automaticamente ao salvar.
