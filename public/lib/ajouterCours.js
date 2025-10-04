window.listeCoursProf = JSON.parse(localStorage.getItem('listeCoursProf') || '[]');

document.addEventListener('DOMContentLoaded', async function () {
  // Fonction qui permet de créer une boîte de cours
  function creerBoiteCours(cours) {
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
    label.textContent = cours.group_id;
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

    // Ajout de l'écouteur sur le bouton Ajouter
    btnAjouter.addEventListener('click', async function () {
      window.listeCoursProf = JSON.parse(localStorage.getItem('listeCoursProf') || '[]');
      if (!window.listeCoursProf.some(c => c.group_id === cours.group_id)) {
        // Récupère les étudiants du cours (SGB)
        let listeEtudiants = [];
        try {
          const res = await fetch(`/api/v1/cours/${cours.group_id}/students`);
          if (res.ok) {
            listeEtudiants = await res.json();
          }
        } catch {}
        // Ajoute la liste d'étudiants à l'objet cours (postcondition)
        const coursComplet = { ...cours, listeEtudiants };
        window.listeCoursProf.push(coursComplet);
        localStorage.setItem('listeCoursProf', JSON.stringify(window.listeCoursProf));
        alert('Cours ajouté à la liste du professeur !');
        console.log(window.listeCoursProf);
      } else {
        alert('Ce cours est déjà dans la liste du professeur.');
      }
    });

    // Ajout de l'écouteur sur le bouton Informations
    btnInfos.addEventListener('click', async function () {
      // Remove old info and student boxes
      const oldBox = document.querySelector('.box-infos-cours');
      if (oldBox) oldBox.remove();
      const oldStudents = document.querySelector('.box-etudiants-cours');
      if (oldStudents) oldStudents.remove();

      // Show course info
      creerBoiteInfos(cours);

      // Fetch and show students
      try {
        const res = await fetch(`/api/v1/cours/${cours.group_id}/students`);
        if (!res.ok) throw new Error();
        const students = await res.json();
        creerBoiteEtudiant(students);
      } catch {
        creerBoiteEtudiant([]);
      }
    });
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

  function creerBoiteEtudiant(students) {
    // Remove old student box if exists
    const oldBox = document.querySelector('.box-etudiants-cours');
    if (oldBox) oldBox.remove();

    const container = document.createElement('div');
    container.className = 'box-etudiants-cours';
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

  //Récupération de l'email du professeur connecté
  const email = localStorage.getItem('email');
  if (!email) {
    alert('Aucun email de professeur trouvé.');
    return;
  }

  // Fetch tous les cours du professeur connecté
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
    // Pour chaque group_id unique, créer une boîte avec le bon objet cours
    uniqueGroupIds.forEach(groupId => {
      const cours = filtered.find(c => c.group_id === groupId);
      if (cours) creerBoiteCours(cours);
    });
  } catch (err) {
    alert('Erreur lors de la récupération des cours.');
  }
});

