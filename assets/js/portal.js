(() => {
  const $ = (selector) => document.querySelector(selector);
  const sections = [...document.querySelectorAll('.report-section')];
  const search = $('#busca');
  const emptyState = $('#vazio');
  const title = $('#titulo');
  const description = $('#disp');

  let scope = {
    type: 'sector',
    sector: document.querySelector('.sector-todos')?.dataset.setor || '',
    label: document.querySelector('.sector-todos')?.dataset.setor || ''
  };

  function markActive(element) {
    document.querySelectorAll('.sidebar-item, .sector').forEach((item) => {
      item.classList.remove('sidebar-item--active');
    });
    if (element) element.classList.add('sidebar-item--active');
  }

  function filterReports() {
    const query = (search?.value || '').toLowerCase().trim();
    let visibleCount = 0;

    sections.forEach((section) => {
      const matchesScope = scope.type === 'all'
        || (scope.type === 'sector' && section.dataset.setor === scope.sector)
        || (scope.type === 'sub' && section.dataset.setor === scope.sector && section.dataset.sub === scope.sub);

      let sectionVisibleCount = 0;
      section.querySelectorAll('.report-card').forEach((card) => {
        const matchesSearch = !query || card.dataset.nome.includes(query);
        const visible = matchesScope && matchesSearch;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          sectionVisibleCount += 1;
          visibleCount += 1;
        }
      });

      section.style.display = sectionVisibleCount ? '' : 'none';
    });

    if (emptyState) emptyState.style.display = visibleCount ? 'none' : '';
    if (title) title.textContent = scope.label;
    if (description) {
      description.textContent = `${visibleCount} relatório${visibleCount === 1 ? '' : 's'} ${query ? 'encontrado' : 'disponível'}${visibleCount === 1 ? '' : 's'}`;
    }
  }

  document.querySelectorAll('.sector').forEach((header) => {
    header.addEventListener('click', () => {
      const wrap = document.querySelector(`.sub-wrap[data-setor="${CSS.escape(header.dataset.setor)}"]`);
      header.classList.toggle('sector--collapsed');
      if (wrap) wrap.classList.toggle('sub-wrap--hidden');
    });
  });

  document.querySelectorAll('.sector-todos').forEach((item) => {
    item.addEventListener('click', (event) => {
      scope = { type: 'sector', sector: item.dataset.setor, label: item.dataset.setor };
      markActive(event.currentTarget);
      filterReports();
    });
  });

  document.querySelectorAll('.sidebar-item[data-sub]').forEach((item) => {
    item.addEventListener('click', (event) => {
      scope = {
        type: 'sub',
        sector: item.dataset.setor,
        sub: item.dataset.sub,
        label: `${item.dataset.setor} · ${item.dataset.sub}`
      };
      markActive(event.currentTarget);
      filterReports();
    });
  });

  search?.addEventListener('input', filterReports);

  const sidebar = document.querySelector('.portal-sidebar');

  if (sidebar) {
    sidebar.classList.remove('portal-sidebar--collapsed');

    let drawerToggle = sidebar.querySelector('.drawer-toggle');
    if (!drawerToggle) {
      drawerToggle = document.createElement('button');
      drawerToggle.className = 'drawer-toggle';
      drawerToggle.type = 'button';
      drawerToggle.setAttribute('aria-label', 'Expandir navegação');
      drawerToggle.setAttribute('aria-expanded', 'false');
      drawerToggle.innerHTML = '<span class="material-symbols-rounded" aria-hidden="true">menu</span>';
      sidebar.prepend(drawerToggle);
    }

    document.querySelectorAll('.sidebar-item__number').forEach((number) => {
      const item = number.closest('.sidebar-item');
      number.className = 'material-symbols-rounded sidebar-item__icon';
      number.textContent = item?.classList.contains('sector-todos') ? 'grid_view' : 'subdirectory_arrow_right';
      number.setAttribute('aria-hidden', 'true');
    });

    document.querySelectorAll('.sector').forEach((sector) => {
      if (!sector.querySelector('.sector__icon')) {
        const icon = document.createElement('span');
        icon.className = 'material-symbols-rounded sector__icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = 'category';
        sector.prepend(icon);
      }

      const arrow = sector.querySelector('.sector__arrow');
      if (arrow) {
        arrow.className = 'material-symbols-rounded sector__arrow';
        arrow.textContent = 'expand_more';
        arrow.setAttribute('aria-hidden', 'true');
      }
    });

    drawerToggle.addEventListener('click', () => {
      const collapsed = sidebar.classList.toggle('portal-sidebar--collapsed');
      drawerToggle.setAttribute('aria-expanded', String(!collapsed));
      drawerToggle.setAttribute('aria-label', collapsed ? 'Expandir navegação' : 'Recolher navegação');

      const icon = drawerToggle.querySelector('.material-symbols-rounded');
      if (icon) icon.textContent = collapsed ? 'menu' : 'menu_open';
    });
  }

  filterReports();
})();
