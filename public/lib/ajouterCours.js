document.addEventListener('DOMContentLoaded', async function () {
  // Fonction qui permet de créer une boîte de cours
  function creerBoiteCours(groupId) {
    const container = document.createElement('div');
    container.className = 'box-ajouter-cours';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'space-between';
    container.style.gap = '1rem';
    container.style.margin = '1.2rem auto';
    container.style.maxWidth = '400px';
    container.style.width = '100%';
    container.style.minWidth = '260px';
    container.style.padding = '0.7rem 1.2rem';
    container.style.border = '1.5px solid #007bff';
    container.style.borderRadius = '8px';
    container.style.background = '#f8f9fa';
    container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';

    //Nom du groupe
    const label = document.createElement('span');
    label.textContent = groupId;
    label.style.fontWeight = 'bold';
    label.style.fontSize = '1.1rem';
    label.style.margin = '0 0.5rem 0 0';
    label.style.flex = '1';
    label.style.textAlign = 'left';

    //Bouton d'informations
    const btnInfos = document.createElement('button');
    btnInfos.textContent = 'Informations';
    btnInfos.className = 'btn btn-primary btn-sm';
    btnInfos.style.fontSize = '0.95rem';
    btnInfos.style.padding = '0.3rem 1.1rem';
    btnInfos.style.margin = '0 0.5rem 0 0';

    //Bouton pour ajouter le cours
    const btnAjouter = document.createElement('button');
    btnAjouter.textContent = 'Ajouter';
    btnAjouter.className = 'btn btn-success btn-sm';
    btnAjouter.style.fontSize = '0.95rem';
    btnAjouter.style.padding = '0.3rem 1.1rem';

    // Ordre : label, btnInfos, btnAjouter
    container.appendChild(label);
    container.appendChild(btnInfos);
    container.appendChild(btnAjouter);
    document.body.appendChild(container);
  }

  function creerBoiteInfos(cours) {
    // Le cours à les identifiants : group_id, day, hours, local, mode
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

    // Identifiant de groupe
    const group = document.createElement('div');
    group.innerHTML = `<strong>Groupe :</strong> ${cours.group_id}`;

    // Jour
    const day = document.createElement('div');
    day.innerHTML = `<strong>Jour :</strong> ${cours.day}`;

    // Horaire
    const hours = document.createElement('div');
    hours.innerHTML = `<strong>Horaire :</strong> ${cours.hours}`;

    // Local
    const local = document.createElement('div');
    local.innerHTML = `<strong>Local :</strong> ${cours.local}`;

    // Présence ou distance
    const mode = document.createElement('div');
    mode.innerHTML = `<strong>Mode :</strong> ${cours.mode}`;

    container.appendChild(group);
    container.appendChild(day);
    container.appendChild(hours);
    container.appendChild(local);
    container.appendChild(mode);
    document.body.appendChild(container);
  }

  function creerBoiteEtudiant(cours) {
  }

  //Récupération de l'email du professeur connecté
  const email = localStorage.getItem('email');
  if (!email) {
    alert('Aucun email de professeur trouvé.');
    return;
  }

  // Fetch tout les cours du professeur connecté
  try {
    const response = await fetch('/api/v1/cours?email=' + encodeURIComponent(email));
    if (!response.ok) throw new Error('Erreur lors de la récupération des cours');
    const filtered = await response.json();
    // Only show one box per unique group_id
    const uniqueGroupIds = [...new Set(filtered.map(c => c.group_id))];
    if (uniqueGroupIds.length === 0) {
      const msg = document.createElement('div');
      msg.textContent = 'Aucun cours trouvé pour ce professeur.';
      msg.style.textAlign = 'center';
      msg.style.margin = '2rem';
      document.body.appendChild(msg);
      return;
    }
    // Pour chaque group_id unique, créer une boîte et lier le bouton à l'affichage des infos du bon cours
    uniqueGroupIds.forEach(groupId => {
      creerBoiteCours(groupId);
      // Sélectionner la dernière boîte créée
      const allBoxes = document.querySelectorAll('.box-ajouter-cours');
      const box = allBoxes[allBoxes.length - 1];
      const btnInfos = box.querySelector('button:nth-of-type(1)');
      // Corriger : seul le bouton Informations affiche les infos
      btnInfos.addEventListener('click', function () {
        // Supprimer l'ancienne boîte d'infos s'il y en a une
        const oldBox = document.querySelector('.box-infos-cours');
        if (oldBox) oldBox.remove();
        // Trouver le premier cours correspondant à ce group_id
        const cours = filtered.find(c => c.group_id === groupId);
        if (cours) creerBoiteInfos(cours);
      });
    });
  } catch (err) {
    alert('Erreur lors de la récupération des cours.');
  }
});

