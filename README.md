# Portal BI Logística

Portal web para visualização e acompanhamento de indicadores logísticos da operação. Será possível encontrar categorizados os BI's de diversas áreas, sendo controlados e monitorado por acessos para cada usuário. 

## Objetivo

Centralizar informações e indicadores logísticos em uma única interface, facilitando a análise operacional e o acompanhamento de métricas da área. Integrando Inteligência artificial para uma facilidade de busca de dados e direcionamento para os BI's correspondentes ao assunto perguntado pelo usuário.

## Arquitetura do Projeto

O repositório é um mono-repo organizado em três partes principais:

### web/
Contém a aplicação front-end e os arquivos gerados para publicação do portal.

### api/
Responsável pelo processamento dos dados e geração dos artefatos consumidos pela interface.

### assets/
Arquivos compartilhados pela aplicação, como estilos visuais, imagens e logotipos.

## Fluxo básico de Funcionamento no repositório

1. Os dados são disponibilizados pelo banco de dados e consumidos em `api/`.
2. O front-end em `web/` apresenta os indicadores ao usuário.
