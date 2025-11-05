document.addEventListener('DOMContentLoaded', () => {
  // Délégué: écoute tous les boutons 'Afficher étudiants'
  document.body.addEventListener('click', async (ev) => {
    const btn = ev.target.closest && ev.target.closest('.btn-show-students');
    if (!btn) return;
    const qnName = btn.getAttribute('data-gnom');
    const groupId = btn.getAttribute('data-group');
    if (!qnName || !groupId) return;

    // Trouver le conteneur lié à ce questionnaire
    const selector = `.students-list-container[data-qn-name="${qnName}"][data-group-id="${groupId}"]`;
    const container = document.querySelector(selector);
    if (!container) return;

    // Toggle: si visible, masquer
    if (container.style.display && container.style.display !== 'none') {
      container.style.display = 'none';
      return;
    }

    // Afficher un message de chargement
    container.style.display = 'block';
    container.innerHTML = '<div class="text-muted">Chargement des étudiants…</div>';

    try {
      // Par défaut, on récupère les étudiants du cours (même groupe)
      const res = await fetch(`/api/v1/cours/${encodeURIComponent(groupId)}/students`);
      if (!res.ok) throw new Error('Erreur serveur');
      const students = await res.json();
      if (!Array.isArray(students) || students.length === 0) {
        container.innerHTML = '<div>Aucun étudiant inscrit.</div>';
        return;
      }
      const ul = document.createElement('ul');
      ul.className = 'mb-0';
      students.forEach(s => {
        const li = document.createElement('li');
        // Garde la forme firstname lastname (id)
        li.textContent = `${s.first_name || s.firstname || ''} ${s.last_name || s.lastname || ''}`.trim() + (s.id ? ` (${s.id})` : '');
        ul.appendChild(li);
      });
      container.innerHTML = '';
      container.appendChild(ul);
    } catch (err) {
      container.innerHTML = '<div class="text-danger">Impossible de charger les étudiants.</div>';
      console.error(err);
    }
  });
});
