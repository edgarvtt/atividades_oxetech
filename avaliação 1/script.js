    // ── Element refs ──────────────────────────────
    const form        = document.getElementById('searchForm');
    const input       = document.getElementById('usernameInput');
    const searchBtn   = document.getElementById('searchBtn');
    const inputError  = document.getElementById('inputError');
    const emptyState  = document.getElementById('emptyState');
    const loader      = document.getElementById('loader');
    const errorState  = document.getElementById('errorState');
    const results     = document.getElementById('results');

    // Profile fields
    const avatar       = document.getElementById('avatar');
    const profileName  = document.getElementById('profileName');
    const profileLogin = document.getElementById('profileLogin');
    const profileBio   = document.getElementById('profileBio');
    const statRepos    = document.getElementById('statRepos');
    const statFollowers= document.getElementById('statFollowers');
    const statFollowing= document.getElementById('statFollowing');
    const metaRow      = document.getElementById('metaRow');
    const reposGrid    = document.getElementById('reposGrid');
    const repoCount    = document.getElementById('repoCount');

    // ── State helpers ─────────────────────────────
    function setView(view) {
      emptyState.classList.add('hidden');
      loader.classList.add('hidden');
      errorState.classList.add('hidden');
      results.classList.add('hidden');
      if (view === 'empty')   emptyState.classList.remove('hidden');
      if (view === 'loading') loader.classList.remove('hidden');
      if (view === 'error')   errorState.classList.remove('hidden');
      if (view === 'results') results.classList.remove('hidden');
    }

    function showInputError(msg) {
      inputError.textContent = '⚠  ' + msg;
      inputError.classList.remove('hidden');
      input.focus();
    }

    function clearInputError() {
      inputError.classList.add('hidden');
      inputError.textContent = '';
    }

    // ── Meta item factory ─────────────────────────
    function metaItem(iconPath, text) {
      const wrap = document.createElement('div');
      wrap.className = 'flex items-center gap-2';
      wrap.style.color = '#555';
      wrap.style.fontSize = '.8rem';
      wrap.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          ${iconPath}
        </svg>
        <span class="mono">${text}</span>`;
      return wrap;
    }

    // ── Repo tag factory ──────────────────────────
    function repoTag(repo, delay) {
      const a = document.createElement('a');
      a.className = 'repo-tag';
      a.href      = repo.html_url;
      a.target    = '_blank';
      a.rel       = 'noopener';
      a.style.animationDelay = delay + 'ms';
      a.title     = repo.description || repo.name;

      const stars = repo.stargazers_count > 0
        ? `<span style="color:#555;margin-left:6px;font-size:.7rem;">★ ${repo.stargazers_count}</span>`
        : '';

      a.innerHTML = `
        <svg class="repo-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3h18v12H3z"/><path d="M3 9h18"/><path d="M9 21l3-6 3 6"/>
        </svg>
        ${repo.name}${stars}`;
      return a;
    }

    // ── Main fetch logic ──────────────────────────
    async function fetchProfile(username) {
      setView('loading');
      searchBtn.disabled = true;

      try {
        // 1 · User profile
        const userRes = await fetch(`https://api.github.com/users/${username}`);

        if (userRes.status === 404) {
          setView('error');
          errorState.innerHTML = `
            <span class="mono text-xs tracking-widest" style="color:#555;">NOT FOUND</span><br/>
            <span style="color:#777;">Nenhum perfil encontrado para <strong style="color:#999;">"${username}"</strong>. Verifique o nome e tente novamente.</span>`;
          return;
        }

        if (!userRes.ok) throw new Error(`Erro ${userRes.status}`);

        const user = await userRes.json();

        // 2 · Repos
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=pushed`);
        const repos = reposRes.ok ? await reposRes.json() : [];

        // ── Render profile ──
        avatar.src       = user.avatar_url;
        avatar.alt       = user.login + ' avatar';
        profileName.textContent  = user.name || user.login;
        profileLogin.textContent = '@' + user.login;
        profileLogin.href        = user.html_url;
        profileBio.textContent   = user.bio || '';
        profileBio.style.display = user.bio ? '' : 'none';

        statRepos.textContent     = fmtNum(user.public_repos);
        statFollowers.textContent = fmtNum(user.followers);
        statFollowing.textContent = fmtNum(user.following);

        // Meta items
        metaRow.innerHTML = '';
        if (user.location) metaRow.appendChild(metaItem(
          '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/>',
          user.location
        ));
        if (user.company)  metaRow.appendChild(metaItem(
          '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>',
          user.company
        ));
        if (user.blog && user.blog.length > 0) metaRow.appendChild(metaItem(
          '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
          user.blog.replace(/^https?:\/\//, '')
        ));

        // ── Render repos ──
        reposGrid.innerHTML = '';
        if (repos.length === 0) {
          reposGrid.innerHTML = '<span class="mono text-xs" style="color:#3d3d3d;">Nenhum repositório público encontrado.</span>';
        } else {
          // Show max 20 most recently pushed
          const slice = repos.slice(0, 20);
          repoCount.textContent = `${slice.length} de ${user.public_repos} exibidos`;
          slice.forEach((repo, i) => {
            reposGrid.appendChild(repoTag(repo, i * 30));
          });
        }

        setView('results');

      } catch (err) {
        setView('error');
        errorState.innerHTML = `
          <span class="mono text-xs tracking-widest" style="color:#555;">ERRO DE CONEXÃO</span><br/>
          <span style="color:#777;">Não foi possível concluir a requisição. Verifique sua conexão e tente novamente.</span>`;
        console.error(err);
      } finally {
        searchBtn.disabled = false;
      }
    }

    function fmtNum(n) {
      if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
      return n;
    }

    // ── Form submission ───────────────────────────
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearInputError();

      const username = input.value.trim();

      if (!username) {
        showInputError('O campo de busca não pode estar vazio. Digite um nome de usuário.');
        return;
      }

      if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(username)) {
        showInputError('Nome de usuário inválido. Use apenas letras, números e hífens.');
        return;
      }

      fetchProfile(username);
    });

    // Clear error on typing
    input.addEventListener('input', clearInputError);