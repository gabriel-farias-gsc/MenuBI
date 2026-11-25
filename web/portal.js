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
    label: document.querySelector('.sector-todos')?.dataset.setor || '',
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
      const matchesScope =
        scope.type === 'all' ||
        (scope.type === 'sector' && section.dataset.setor === scope.sector) ||
        (scope.type === 'sub' &&
          section.dataset.setor === scope.sector &&
          section.dataset.sub === scope.sub);

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
      const wrap = document.querySelector(
        `.sub-wrap[data-setor="${CSS.escape(header.dataset.setor)}"]`
      );
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
        label: `${item.dataset.setor} · ${item.dataset.sub}`,
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
      drawerToggle.innerHTML =
        '<span class="material-symbols-rounded" aria-hidden="true">menu</span>';
      sidebar.prepend(drawerToggle);
    }

    document.querySelectorAll('.sidebar-item__number').forEach((number) => {
      const item = number.closest('.sidebar-item');
      number.className = 'material-symbols-rounded sidebar-item__icon';
      number.textContent = item?.classList.contains('sector-todos')
        ? 'grid_view'
        : 'subdirectory_arrow_right';
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
      drawerToggle.setAttribute(
        'aria-label',
        collapsed ? 'Expandir navegação' : 'Recolher navegação'
      );

      const icon = drawerToggle.querySelector('.material-symbols-rounded');
      if (icon) icon.textContent = collapsed ? 'menu' : 'menu_open';
    });
  }

  filterReports();

  const agentButton = document.querySelector('.btn-agent');
  const body = document.body;

  if (!agentButton) return;

  let tooltip;

  agentButton?.addEventListener('mouseenter', () => {
    if (tooltip) return;

    tooltip = document.createElement('div');
    tooltip.className = 'agent-tooltip';
    tooltip.textContent = 'Em que posso ajudar?';

    document.body.appendChild(tooltip);

    const rect = agentButton.getBoundingClientRect();

    tooltip.style.left = `${rect.left + rect.width / 2}px`;

    tooltip.style.top = `${rect.top - 12}px`;

    requestAnimationFrame(() => {
      tooltip.classList.add('agent-tooltip--visible');
    });
  });

  agentButton?.addEventListener('mouseleave', () => {
    if (!tooltip) return;

    tooltip.classList.remove('agent-tooltip--visible');

    const current = tooltip;
    tooltip = null;

    setTimeout(() => current.remove(), 200);
  });

  agentButton.addEventListener('click', () => {
    // já existe? não cria outro
    let modal = document.querySelector('.agent-modal');

    if (modal) {
      return;
    }

    body.insertAdjacentHTML(
      'beforeend',
      `
      <div class="agent-modal">
        <div class="agent-modal__content">

         <div class="chat-container">

    <header class="chat-header">
        <div class="header-left">

           
          <img src="/assets/agent-logo.png" width="38" height="38" class="logo" />

            <div class="title-group">
                <h1>Agente Master</h1>
                <span>Conectado</span>
            </div>
        </div>

        <div class="header-actions">
            <button class="action-btn" id="agent-modal-minimize">−</button>
            <button class="action-btn" id="agent-modal-close">×</button>
        </div>
    </header>

    <main class="chat-body">

        <div class="bot-message">
            Olá! Sou o Agente Master, como posso ajudá-lo hoje?
        </div>

    </main>

    <footer class="chat-footer">


        <div class="input-wrapper">
        
        <button class="attach-btn">
           +
        </button>
            <input
                type="text"
                placeholder="Digite sua mensagem..."
            >
             <button class="send-btn">
              <span class="material-symbols-outlined">
arrow_upward
</span>
             </button>
        </div>

       

    </footer>

</div>

        </div>
      </div>
      `
    );

    agentButton.style.display = 'none';

    // pega o modal recém criado
    modal = document.querySelector('.agent-modal');

    modal.querySelector('#agent-modal-close').addEventListener('click', () => {
      modal.remove();
      agentButton.style.display = 'flex';
    });
  });
})();
