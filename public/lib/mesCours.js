// Fonction utilitaire pour obtenir la clé de stockage selon l'email
function getListeCoursProfKey(email) {
  return `listeCoursProf_${email}`;
}

// Récupération de l'email du professeur connecté
const email = localStorage.getItem('email');
if (!email) {
  alert('Aucun email de professeur trouvé.');
  throw new Error('Aucun email de professeur trouvé.');
}

// --- Nouveau : contrôle de rôle (empêche l'accès aux étudiants côté client)
const role = (window && window.__USER_ROLE__) || localStorage.getItem('role') || '';
const isTeacher = role === 'enseignant';

// charger la liste seulement si enseignant (évite fuite d'infos côté client)
window.listeCoursProf = isTeacher ? JSON.parse(localStorage.getItem(getListeCoursProfKey(email)) || '[]') : [];

document.addEventListener('DOMContentLoaded', function () {
  // si ce n'est pas un enseignant, afficher message et ne pas initialiser la page
  if (!isTeacher) {
    document.body.innerHTML = '';
    const container = document.createElement('div');
    container.style.margin = '3rem';
    container.style.textAlign = 'center';
    container.innerHTML = '<div class="alert alert-danger" role="alert">Accès réservé aux enseignants.</div>';
    const retour = document.createElement('a');
    retour.href = '/';
    retour.className = 'btn btn-secondary mt-3';
    retour.textContent = 'Retour';
    container.appendChild(retour);
    document.body.appendChild(container);
    console.warn('Accès à mesCours bloqué pour le rôle:', role || '(non défini)');
    return; // stop further initialization
  }

  // S'assurer qu'il y a un conteneur dédié dans la page
  let container = document.getElementById('mes-cours-list');
  if (!container) {
    container = document.createElement('div');
    container.id = 'mes-cours-list';
    document.body.appendChild(container);
  }

  function creerBoiteCours(cours) {
    const box = document.createElement('div');
    box.className = 'box-ajouter-cours';
    box.style.display = 'flex';
    box.style.alignItems = 'center';
    box.style.justifyContent = 'space-between';
    box.style.gap = '1rem';
    box.style.margin = '1.2rem auto';
    box.style.maxWidth = 'fit-content';  // ✅ la boîte s’élargit selon le contenu
    box.style.width = 'auto';            // ✅ ne force plus à 100%
    box.style.minWidth = '260px';
    box.style.padding = '0.7rem 1.2rem';
    box.style.border = '1.5px solid #007bff';
    box.style.borderRadius = '8px';
    box.style.background = '#f8f9fa';
    box.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';

    const label = document.createElement('span');
    label.textContent = cours.group_id;
    label.style.fontWeight = 'bold';
    label.style.fontSize = '1.1rem';
    label.style.margin = '0 0.5rem 0 0';
    label.style.flex = '1';
    label.style.textAlign = 'left';

    // Groupe de boutons à droite
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.alignItems = 'center';
    actions.style.gap = '0.5rem';

    const btnInfos = document.createElement('button');
    btnInfos.textContent = 'Informations';
    btnInfos.className = 'btn btn-primary btn-sm';
    btnInfos.style.fontSize = '0.95rem';
    btnInfos.style.padding = '0.3rem 1.1rem';
    btnInfos.style.margin = '0 0.5rem 0 0';

    const btnSupprimer = document.createElement('button');
    btnSupprimer.textContent = 'Supprimer';
    btnSupprimer.className = 'btn btn-danger btn-sm';
    btnSupprimer.style.fontSize = '0.95rem';
    btnSupprimer.style.padding = '0.3rem 1.1rem';

    // Bouton Gestion questions (ouvre la page serveur)
    const linkManageQuestions = document.createElement('a');
    linkManageQuestions.href = `/cours/${encodeURIComponent(cours.group_id)}/gestionQuestions`;
    linkManageQuestions.className = 'btn btn-primary btn-sm';
    linkManageQuestions.textContent = 'Gestion questions';
    linkManageQuestions.style.fontSize = '0.95rem';
    linkManageQuestions.style.padding = '0.3rem 1.1rem';

    // ✅ Nouveau bouton : Gestion questionnaires
    const linkManageQuestionnaires = document.createElement('a');
    linkManageQuestionnaires.href = `/cours/${encodeURIComponent(cours.group_id)}/gestionQuestionnaires`;
    linkManageQuestionnaires.className = 'btn btn-primary btn-sm';
    linkManageQuestionnaires.textContent = 'Gestion questionnaires';
    linkManageQuestionnaires.style.fontSize = '0.95rem';
    linkManageQuestionnaires.style.padding = '0.3rem 1.1rem';

    // Ordre d’affichage
    box.appendChild(label);
    actions.appendChild(btnInfos);
    actions.appendChild(linkManageQuestions);
    actions.appendChild(linkManageQuestionnaires); // << inséré ici
    actions.appendChild(btnSupprimer);
    box.appendChild(actions);

    btnSupprimer.addEventListener('click', function () {
      if (!confirm('Voulez-vous vraiment supprimer ce cours ?')) return;
      window.listeCoursProf = window.listeCoursProf.filter(c => c.group_id !== cours.group_id);
      localStorage.setItem(getListeCoursProfKey(email), JSON.stringify(window.listeCoursProf));
      // Supprimer la boîte d'infos et la boîte d'étudiants si elles concernent ce cours
      const infoBox = document.querySelector('.box-infos-cours');
      if (infoBox && infoBox.textContent.includes(cours.group_id)) infoBox.remove();
      const studentsBox = document.querySelector('.box-etudiants-cours');
      if (studentsBox && studentsBox.getAttribute('data-group-id') === cours.group_id) studentsBox.remove();
      afficherMesCours();
      alert(`Cours "${cours.group_id}" supprimé avec succès.`);
      console.log(window.listeCoursProf); // Affiche la liste après suppression
    });

    btnInfos.addEventListener('click', function () {
      const oldBox = document.querySelector('.box-infos-cours');
      if (oldBox) oldBox.remove();
      const oldStudents = document.querySelector('.box-etudiants-cours');
      if (oldStudents) oldStudents.remove();
      creerBoiteInfos(cours);
      creerBoiteEtudiant(cours.listeEtudiants || [], cours.group_id);
    });

    return box;
  }

  function creerBoiteInfos(cours) {
    const container = document.createElement('div');
    container.className = 'box-infos-cours';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-start';
    container.style.justifyContent = 'center';
    container.style.gap = '0.3rem';
    container.style.margin = '1rem auto';
    container.style.maxWidth = '320px';
    container.style.padding = '0.75rem 1rem';
    container.style.border = '1px solid #007bff';
    container.style.borderRadius = '8px';
    container.style.background = '#e9f5ff';
    container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';

    const group = document.createElement('div');
    group.innerHTML = `<strong>Groupe :</strong> ${cours.group_id}`;
    const day = document.createElement('div');
    day.innerHTML = `<strong>Jour :</strong> ${cours.day}`;
    const hours = document.createElement('div');
    hours.innerHTML = `<strong>Horaire :</strong> ${cours.hours}`;
    const local = document.createElement('div');
    local.innerHTML = `<strong>Local :</strong> ${cours.local}`;
    const mode = document.createElement('div');
    mode.innerHTML = `<strong>Mode :</strong> ${cours.mode}`;

    container.appendChild(group);
    container.appendChild(day);
    container.appendChild(hours);
    container.appendChild(local);
    container.appendChild(mode);
    document.body.appendChild(container);
  }

  function creerBoiteEtudiant(students, groupId) {
    const oldBox = document.querySelector('.box-etudiants-cours');
    if (oldBox) oldBox.remove();

    const container = document.createElement('div');
    container.className = 'box-etudiants-cours';
    container.setAttribute('data-group-id', groupId || '');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-start';
    container.style.justifyContent = 'center';
    container.style.gap = '0.3rem';
    container.style.margin = '1rem auto';
    container.style.maxWidth = '340px';
    container.style.padding = '0.75rem 1rem';
    container.style.border = '1px solid #28a745';
    container.style.borderRadius = '8px';
    container.style.background = '#f3fff3';
    container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';

    const title = document.createElement('div');
    title.innerHTML = `<strong>Étudiants du cours :</strong>`;
    container.appendChild(title);

    if (students.length === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'Aucun étudiant inscrit.';
      container.appendChild(empty);
    } else {
      const ul = document.createElement('ul');
      students.forEach(s => {
        const li = document.createElement('li');
        li.textContent = `${s.first_name} ${s.last_name} (${s.id})`;
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }
    document.body.appendChild(container);
  }

  function afficherMesCours() {
    container.innerHTML = '';
    if (!window.listeCoursProf || window.listeCoursProf.length === 0) {
      const msg = document.createElement('div');
      msg.textContent = 'Aucun cours ajouté.';
      msg.style.textAlign = 'center';
      msg.style.margin = '2rem';
      container.appendChild(msg);
      return;
    }
    window.listeCoursProf.forEach(cours => container.appendChild(creerBoiteCours(cours)));
  }

  afficherMesCours();
});
