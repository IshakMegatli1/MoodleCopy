// /lib/gestionDevoirs.js
document.addEventListener('DOMContentLoaded', () => {
  // Délégué: écoute tous les clics sur les boutons "Afficher étudiants"
  document.body.addEventListener('click', async (ev) => {
    const btn = ev.target.closest && ev.target.closest('.btn-show-students');
    if (!btn) return;

    const devTitle = btn.getAttribute('data-devtitle');
    const groupId  = btn.getAttribute('data-group');
    if (!devTitle || !groupId) return;

    // Trouver le conteneur lié à ce devoir
    // (même logique que gestionQuestionnaires.js, mais avec les bons data-*)
    const selector = `.students-list-container[data-dev-title="${devTitle}"][data-group-id="${groupId}"]`;
    const container = document.querySelector(selector);
    if (!container) return;

    // Toggle d'affichage: si visible, on masque
    if (container.style.display && container.style.display !== 'none') {
      container.style.display = 'none';
      // (Optionnel) remettre le texte du bouton
      // btn.textContent = 'Afficher étudiants';
      return;
    }

    // Afficher le conteneur + message de chargement
    container.style.display = 'block';
    container.innerHTML = '<div class="text-muted">Chargement des étudiants…</div>';

    try {
      // Par défaut: on récupère les étudiants inscrits au cours (même groupe)
      // Même endpoint que dans gestionQuestionnaires.js
      const res = await fetch(`/api/v1/cours/${encodeURIComponent(groupId)}/students`);
      if (!res.ok) throw new Error('Erreur serveur');
      const students = await res.json();

      if (!Array.isArray(students) || students.length === 0) {
        container.innerHTML = '<div>Aucun étudiant inscrit.</div>';
        return;
      }

      // Rendu simple (liste)
      const ul = document.createElement('ul');
      ul.className = 'mb-0';
      students.forEach(s => {
        const li = document.createElement('li');
        const first = s.first_name || s.firstname || '';
        const last  = s.last_name  || s.lastname  || '';
        const name  = `${first} ${last}`.trim();
        li.textContent = name + (s.id ? ` (${s.id})` : '');
        ul.appendChild(li);
      });

      container.innerHTML = '';
      container.appendChild(ul);

      // (Optionnel) changer le texte du bouton en "Masquer étudiants"
      // btn.textContent = 'Masquer étudiants';
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="text-danger">Impossible de charger les étudiants.</div>';
    }
  });
});
