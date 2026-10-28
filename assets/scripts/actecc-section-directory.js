(() => {
  // Acceso a la consulta documental del Libro Blanco.
  const mainNav = document.querySelector('body > nav');
  if (mainNav && !mainNav.querySelector('a[href="consultar.html"]')) {
    const askLink = document.createElement('a');
    askLink.href = 'consultar.html';
    askLink.textContent = 'Preguntar';
    mainNav.insertBefore(askLink, mainNav.querySelector('a[href="relato.html"]'));
  }

  const openAncestors = target => {
    let node = target;
    while (node) {
      if (node instanceof HTMLDetailsElement) node.open = true;
      node = node.parentElement;
    }
  };

  const revealHashTarget = (hash, shouldScroll = false) => {
    if (!hash || hash === '#') return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) return;
    openAncestors(target);
    if (shouldScroll) {
      requestAnimationFrame(() => target.scrollIntoView({behavior:'smooth', block:'start'}));
    }
  };

  document.addEventListener('click', event => {
    const link = event.target.closest('.section-directory a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    openAncestors(target);
    history.pushState(null, '', link.hash);
    requestAnimationFrame(() => target.scrollIntoView({behavior:'smooth', block:'start'}));
  });

  window.addEventListener('hashchange', () => revealHashTarget(location.hash));
  revealHashTarget(location.hash);
})();
