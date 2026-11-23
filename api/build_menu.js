const { createRequire } = require('module');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const requireWeb = createRequire(path.join(projectRoot, 'web', 'package.json'));
const XLSX = requireWeb('xlsx');
const basePath = process.env.BASE
  ? path.resolve(projectRoot, process.env.BASE)
  : path.join(projectRoot, 'api', 'data', 'Portal_BI_Estrutura.xlsx');
const logoPath = path.join(projectRoot, 'assets', 'logo.txt');
const outputPath = path.join(projectRoot, 'web', 'index.html');

const workbook = XLSX.readFile(basePath);
const readSheet = (name) => workbook.Sheets[name]
  ? XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: '' })
  : [];

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const yes = (value) => String(value).trim().toLowerCase() === 'sim';
const config = {};
readSheet('Config').forEach((row) => {
  if (row.Chave) config[row.Chave] = row.Valor;
});

const areas = readSheet('Areas')
  .filter((row) => row.Area)
  .sort((a, b) => (a.Ordem || 0) - (b.Ordem || 0));
const subareas = readSheet('SubAreas')
  .filter((row) => row.SubArea)
  .sort((a, b) => (a.Ordem || 0) - (b.Ordem || 0));
const indicators = readSheet('Indicadores').filter((row) => row.Indicador);

const subareasBySector = {};
areas.forEach((area) => { subareasBySector[area.Area] = []; });
subareas.forEach((subarea) => {
  (subareasBySector[subarea.Area] ||= []).push(subarea.SubArea);
});

const cardsBySubarea = (area, subarea) => indicators.filter((item) =>
  item.Area === area && item.SubArea === subarea
);

function cardTemplate(item) {
  const badges = [];
  if (yes(item.Colaborativa)) badges.push('<span class="badge badge--collaborative" title="Colaborativa">C</span>');
  if (yes(item.IA)) badges.push('<span class="badge badge--ai" title="Inteligência Artificial">IA</span>');
  if (String(item.Nota).trim()) badges.push(`<span class="badge badge--validation">${escapeHtml(item.Nota)}</span>`);

  return `<article class="report-card" data-nome="${escapeHtml(item.Indicador).toLowerCase()}">
    <h3 class="report-card__name">${escapeHtml(item.Indicador)}</h3>
    <div class="report-card__meta">
      <span><strong>Atualização</strong> · ${escapeHtml(item.Periodicidade || '—')}</span>
      <span><strong>Fonte</strong> · ${escapeHtml(item.Fonte || '—')}</span>
    </div>
    <footer class="report-card__footer">
      ${badges.join('')}<span class="report-card__arrow" aria-hidden="true">›</span>
    </footer>
  </article>`;
}

const firstFullSector = (areas.find((area) =>
  (subareasBySector[area.Area] || []).some((subarea) => cardsBySubarea(area.Area, subarea).length)
) || areas[0] || {}).Area || '';

let sidebarHtml = '';
areas.forEach((area) => {
  const subareasForSector = subareasBySector[area.Area] || [];
  const total = subareasForSector.reduce((count, subarea) => count + cardsBySubarea(area.Area, subarea).length, 0);
  const collapsed = total === 0;

  sidebarHtml += `<div class="sector${collapsed ? ' sector--collapsed' : ''}" data-setor="${escapeHtml(area.Area)}">
    <span class="material-symbols-rounded sector__icon" aria-hidden="true">category</span>
    <span class="sector__name">${escapeHtml(area.Area)}</span>
    <span class="sector__count">${total}</span>
    <span class="material-symbols-rounded sector__arrow" aria-hidden="true">expand_more</span>
  </div>
  <div class="sub-wrap${collapsed ? ' sub-wrap--hidden' : ''}" data-setor="${escapeHtml(area.Area)}">
    <div class="sidebar-item sidebar-item--sub sector-todos${area.Area === firstFullSector ? ' sidebar-item--active' : ''}" data-setor="${escapeHtml(area.Area)}">
      <span class="material-symbols-rounded sidebar-item__icon" aria-hidden="true">grid_view</span>
      <span class="sidebar-item__name">${escapeHtml(config.LabelTodos || 'Todos os indicadores')}</span>
      <span class="sidebar-item__count">${total}</span>
    </div>`;

  subareasForSector.forEach((subarea) => {
    const count = cardsBySubarea(area.Area, subarea).length;
    sidebarHtml += `<div class="sidebar-item sidebar-item--sub${count ? '' : ' sidebar-item--empty'}" data-setor="${escapeHtml(area.Area)}" data-sub="${escapeHtml(subarea)}">
      <span class="material-symbols-rounded sidebar-item__icon" aria-hidden="true">subdirectory_arrow_right</span>
      <span class="sidebar-item__name">${escapeHtml(subarea)}</span>
      <span class="sidebar-item__count">${count}</span>
    </div>`;
  });

  sidebarHtml += '</div>';
});

let contentHtml = '';
areas.forEach((area) => {
  (subareasBySector[area.Area] || []).forEach((subarea) => {
    const cards = cardsBySubarea(area.Area, subarea);
    if (!cards.length) return;
    contentHtml += `<section class="report-section" data-setor="${escapeHtml(area.Area)}" data-sub="${escapeHtml(subarea)}">
      <h2 class="report-section__title">${escapeHtml(subarea)} <span class="report-section__count">${cards.length}</span></h2>
      <div class="report-grid">${cards.map(cardTemplate).join('')}</div>
    </section>`;
  });
});

const logo = fs.readFileSync(logoPath, 'utf8').trim();
const title = escapeHtml(config.Titulo || 'Portal BI Logística');

const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0,0&display=swap">
  <link rel="stylesheet" href="../assets/css/tokens.css">
  <link rel="stylesheet" href="../assets/css/layout.css">
  <link rel="stylesheet" href="../assets/css/components.css">
</head>
<body>
  <header class="portal-header">
    <div class="header-title">
      <span class="header-title__main">${title}</span>
      <span class="header-title__subtitle">${escapeHtml(config.Subtitulo || '')}</span>
    </div>
    <label class="header-search" for="busca">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.5" y2="16.5"></line>
      </svg>
      <input id="busca" type="search" placeholder="${escapeHtml(config.BuscarPlaceholder || 'Buscar relatório…')}" autocomplete="off">
    </label>
    <img class="header-logo" src="${logo}" alt="GrupoSC">
  </header>

  <div class="portal-body">
    <aside class="portal-sidebar" aria-label="Navegação do portal">
      <button class="drawer-toggle" type="button" aria-label="Recolher navegação" aria-expanded="true">
        <span class="material-symbols-rounded" aria-hidden="true">menu_open</span>
        <span class="drawer-toggle__label">Menu de navegação</span>
      </button>
      <div class="sidebar-scroll">
        <div class="sidebar-label">Áreas</div>
        ${sidebarHtml}
      </div>
      <div class="sidebar-legend">
        <div class="sidebar-legend__title">LEGENDA</div>
        <div class="sidebar-legend__row"><span class="badge badge--collaborative">C</span> Colaborativa</div>
        <div class="sidebar-legend__row"><span class="badge badge--ai">IA</span> Relatório com Inteligência Artificial</div>
        <div class="sidebar-legend__row"><span class="badge badge--validation">Em validação</span> Relatórios em homologação</div>
      </div>
    </aside>

    <main class="portal-content">
      <h1 class="content-title" id="titulo">${escapeHtml(config.LabelTodos || 'Todos os indicadores')}</h1>
      <div class="content-description" id="disp">${indicators.length} relatórios disponíveis</div>
      ${contentHtml}
      <div class="empty-state" id="vazio" style="display:none">Nenhum relatório para o filtro atual.</div>
    </main>
  </div>

  <script src="portal.js"></script>
</body>
</html>`;

fs.writeFileSync(outputPath, html);
console.log(`web/index.html gerado em ${outputPath}`);
console.log(`Setores: ${areas.length} | Sub-áreas: ${subareas.length} | Indicadores: ${indicators.length}`);
