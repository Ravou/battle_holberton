// -----------------------------
// Variables globales
// -----------------------------
let groups = [];
let currentTaskIndex = 0;
let timerDuration = 5 * 60; // 5 minutes
let timerInterval;
let codeurIndex = { A: 0, B: 0 };
let taskValidation = { A: false, B: false }; // points du tour courant ou false si non soumis
let taskWinners = [];
let groupTotals = { A: 0, B: 0 };
let taskResults = []; // [{ A:{points,passed,breakdown,checksCount}, B:{...}, winner:"A|B|Égalité" }]

// -----------------------------
// Affichage étudiants
// -----------------------------
function displayStudents() {
  document.getElementById('studentList').innerHTML =
    students.map(s => `<div>${s}</div>`).join('');
}
displayStudents();

// -----------------------------
// Former groupes
// -----------------------------
function formGroups() {
  let copy = [...students];
  groups = [];
  while (copy.length > 1) {
    const i1 = Math.floor(Math.random() * copy.length);
    const p1 = copy.splice(i1, 1)[0];
    const i2 = Math.floor(Math.random() * copy.length);
    const p2 = copy.splice(i2, 1)[0];
    groups.push([p1, p2]);
  }
  if (copy.length === 1) {
    if (groups.length > 0) {
      groups[groups.length - 1].push(copy[0]);
    } else {
      groups.push([copy[0]]);
    }
  }
  document.getElementById('groupsList').innerHTML =
    groups.map((g, i) => `<div>Groupe ${i + 1}: ${g.join(' & ')}</div>`).join('');
  startTask();
}

// -----------------------------
// Démarrer tâche courante
// -----------------------------
function startTask() {
  if (currentTaskIndex >= tasks.length) {
    document.getElementById('currentTask').innerText = "Toutes les tâches terminées !";
    document.getElementById('timerDisplay').innerText = "00:00";
    displayRecap();
    return;
  }

  taskValidation = { A: false, B: false };
  document.getElementById('validationResult').innerText = "";
  document.getElementById('codeInputA').value = "";
  // On cache le textarea de B, il est simulé
  document.getElementById('codeInputB').style.display = 'none';
  document.querySelector('button[onclick="validateCode(\'B\')"]').style.display = 'none';

  document.getElementById('currentTask').innerText = tasks[currentTaskIndex];

  const codeurA = groups[0][codeurIndex.A % groups[0].length];
  const codeurB = groups[1][codeurIndex.B % groups[1].length];
  document.getElementById('codeurA').innerText = codeurA;
  document.getElementById('codeurB').innerText = codeurB;
  codeurIndex.A++;
  codeurIndex.B++;

  // Timer
  let timeLeft = timerDuration;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;
    document.getElementById('timerDisplay').innerText =
      `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      checkBothValidated();
    }
    timeLeft--;
  }, 1000);
}

// -----------------------------
// Simulation code B
// -----------------------------
function simulateCodeB() {
  // Prend le code de référence du checker
  const codeRef = taskCheckerCode[currentTaskIndex];
  // On simule erreurs aléatoires : 70% correct, 30% modifié
  const rand = Math.random();
  if (rand < 0.7) {
    return codeRef; // correct
  } else {
    // Faux : on modifie légèrement
    return codeRef.replace(/printf/g, "print"); // provoque un fail
  }
}

// -----------------------------
// Évaluer un code avec le checker
// -----------------------------
function evaluateCode(code) {
  const checker = taskCheckers[currentTaskIndex];
  const breakdown = checker(code);
  const checks = Object.keys(breakdown);
  const points = checks.reduce((acc, k) => acc + (breakdown[k] ? 1 : 0), 0);
  const passed = points === checks.length;
  return { points, passed, breakdown, checksCount: checks.length };
}

// -----------------------------
// Validation du code
// -----------------------------
function validateCode(team) {
  let code;
  if (team === "B") {
    code = simulateCodeB();
  } else {
    code = document.getElementById(`codeInput${team}`).value || "";
  }
  const evalRes = evaluateCode(code);

  if (!taskResults[currentTaskIndex]) {
    taskResults[currentTaskIndex] = { A: null, B: null, winner: null };
  }
  taskResults[currentTaskIndex][team] = evalRes;

  let output = `<strong>Résultats Groupe ${team} :</strong><br>`;
  for (const key in evalRes.breakdown) {
    output += `${key} : ${evalRes.breakdown[key] ? "✅" : "❌"}<br>`;
  }
  output += `Points : ${evalRes.points}/${evalRes.checksCount}<br><br>`;
  document.getElementById('validationResult').innerHTML += output;

  taskValidation[team] = evalRes.points;

  if (taskValidation.A !== false && taskValidation.B !== false) {
    finalizeCurrentTask();
  } else {
    document.getElementById('validationResult').innerHTML +=
      `👉 Groupe ${team} a validé, attendre l'autre équipe...<br><br>`;
  }
}

// -----------------------------
// Finaliser tâche
// -----------------------------
function finalizeCurrentTask() {
  clearInterval(timerInterval);
  let winner;
  if (taskValidation.A > taskValidation.B) winner = "A";
  else if (taskValidation.B > taskValidation.A) winner = "B";
  else winner = "Égalité";

  groupTotals.A += taskValidation.A;
  groupTotals.B += taskValidation.B;

  taskWinners[currentTaskIndex] = winner;
  taskResults[currentTaskIndex].winner = winner;

  document.getElementById('validationResult').innerHTML +=
    `🏆 Tâche ${currentTaskIndex + 1} terminée ! Gagnant : Groupe ${winner}<br>`;

  setTimeout(() => {
    currentTaskIndex++;
    startTask();
  }, 2000);
}

// -----------------------------
// Timer expiré → validation forcée
// -----------------------------
function checkBothValidated() {
  if (taskValidation.A === false) validateCode('A');
  if (taskValidation.B === false) validateCode('B');
  if (taskValidation.A !== false && taskValidation.B !== false) finalizeCurrentTask();
}

// -----------------------------
// Affichage récapitulatif final
// -----------------------------
function displayRecap() {
  const recapDiv = document.getElementById('recap');
  recapDiv.innerHTML = "";

  recapDiv.innerHTML += `
    <div style="margin-bottom:8px;">
      <strong>Scores totaux</strong><br>
      Groupe A : ${groupTotals.A} pts &nbsp;|&nbsp; Groupe B : ${groupTotals.B} pts
    </div>
  `;

  taskResults.forEach((res, i) => {
    if (!res) return;
    const a = res.A, b = res.B;
    const title = tasks[i].split("\n")[0];
    const line = document.createElement('div');
    line.className = "task-line";
    line.innerHTML = `
      <strong>Tâche ${i} — ${title}</strong><br>
      Groupe A : ${a ? (a.passed ? "✅" : "❌") : "—"} ${a ? `${a.points}/${a.checksCount} pts` : ""}<br>
      Groupe B : ${b ? (b.passed ? "✅" : "❌") : "—"} ${b ? `${b.points}/${b.checksCount} pts` : ""}<br>
      Gagnant : ${res.winner}
    `;
    recapDiv.appendChild(line);
  });

  const aToReview = [], bToReview = [];
  taskResults.forEach((res, i) => {
    if (res?.A && !res.A.passed) aToReview.push(i);
    if (res?.B && !res.B.passed) bToReview.push(i);
  });

  recapDiv.innerHTML += `
    <div style="margin-top:10px;">
      <strong>À revoir</strong><br>
      Groupe A : ${aToReview.length ? aToReview.map(i => `T${i}`).join(", ") : "— ✅ rien à revoir"}<br>
      Groupe B : ${bToReview.length ? bToReview.map(i => `T${i}`).join(", ") : "— ✅ rien à revoir"}
    </div>
    <div style="margin-top:10px;padding:10px;border:1px dashed #aaa;border-radius:6px;">
      <em>Consigne :</em> prenez 3–5 minutes en binôme pour vous concerter sur les tâches non réussies.
      Pour chaque tâche à revoir, répondez à voix haute :
      (1) qu’est-ce qui était attendu ? (2) où votre code échoue ? (3) quelle correction minimale faut-il apporter ?
    </div>
  `;
  document.getElementById('finalBtn').style.display = 'inline-block';
}

function finalizeExplanation() {
  document.getElementById('recap').innerHTML += "<br>Explication terminée pour tous. Bravo !";
  document.getElementById('finalBtn').style.display = 'none';
}
