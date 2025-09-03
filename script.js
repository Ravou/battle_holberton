function formConfrontations(groups) {
  let confrontations = [];
  let groupsCopy = [...groups];
  while (groupsCopy.length > 1) {
    let g1 = groupsCopy.shift();
    let g2 = groupsCopy.shift();
    confrontations.push([g1, g2]);
  }
  // Si un groupe reste sans adversaire (nombre impair de groupes)
  if (groupsCopy.length === 1) {
    confrontations.push([groupsCopy[0], ["Pas d'adversaire"]]);
  }
  return confrontations;

  const groupsDiv = document.getElementById('groupsList');
  groupsDiv.innerHTML = groups.map((g, i) => `<div class="pair">Groupe ${i+1} : ${g.join(' , ')}</div>`).join('');

  // Forme les confrontations
  const confrontations = formConfrontations(groups);

  // Affiche les confrontations
  displayConfrontations(confrontations);

  // Reset autre état
  currentTaskIndex = -1;
  currentGroup = 0;
  document.getElementById('task').innerHTML = '';
  document.getElementById('validationResult').innerHTML = '';
  document.getElementById('validateBtn').style.display = 'none';
  document.getElementById('treeRoot').innerHTML = '';
}

function displayConfrontations(confrontations) {
  const div = document.getElementById('confrontationsList');
  div.innerHTML = confrontations.map((pair, i) => 
    `<div>Confrontation ${i + 1} : <b>${pair[0].join(", ")}</b> vs <b>${pair[1].join(", ")}</b></div>`
  ).join('');
}

function formGroups() {
  let studentsCopy = [...students];
  groups = [];
  while (studentsCopy.length >= 4) {
    let group = [];
    for (let i = 0; i < 4; i++) {
      let idx = Math.floor(Math.random() * studentsCopy.length);
      group.push(studentsCopy.splice(idx, 1)[0]);
    }
    groups.push(group);
  }
  if (studentsCopy.length > 0) {
    groups.push(studentsCopy);
  }
  const groupsDiv = document.getElementById('groupsList');
  groupsDiv.innerHTML = groups.map((g, i) => `<div class="pair">Groupe ${i+1} : ${g.join(', ')}</div>`).join('');

  // Générer et afficher les confrontations
  const confrontations = formConfrontations(groups);
  displayConfrontations(confrontations);

  currentTaskIndex = -1;
  currentGroup = 0;
  document.getElementById('task').innerHTML = '';
  document.getElementById('validationResult').innerHTML = '';
  document.getElementById('validateBtn').style.display = 'none';
  document.getElementById('treeRoot').innerHTML = '';
}

