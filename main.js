// -----------------------------
// Variables globales
// -----------------------------
let groups = [];
let currentTaskIndex = 0;
let timerDuration = 5 * 60;
let timerInterval;
let codeurIndex = { A: 0, B: 0 };
let taskValidation = { A: false, B: false };
let taskWinners = [];
let groupTotals = { A: 0, B: 0 };
let taskResults = [];

// Réponses fixes pour B, dans l'ordre des tâches
const fixedBResponses = [
`#include <stdio.h>
int main() {
    printf("Hello\\n");
    return 0;
}`,
`#include <stdio.h>
int main(int argc, char *argv[]) {
    printf("%d\\n", argc);
    return 0;
}`,
`#include <stdio.h>
int main(int argc, char *argv[]) {
    for (int i = 0; i < argc; i++) {
        printf("%s\\n", argv[i]);
    }
    return 0;
}`
];

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
    if (groups.length > 0) groups[groups.length - 1].push(copy[0]);
    else groups.push([copy[0]]);
  }
  document.getElementById('groupsList').innerHTML =
    groups.map((g,i) => `<div>Groupe ${i+1}: ${g.join(' & ')}</div>`).join('');
  startTask();
}

// -----------------------------
// Démarrer tâche courante
// -----------------------------
function startTask() {
  if(currentTaskIndex >= tasks.length) {
    document.getElementById('currentTask').innerText = "Toutes les tâches terminées !";
    document.getElementById('timerDisplay').innerText = "00:00";
    displayRecap();
    return;
  }

  taskValidation = {A:false, B:false};
  document.getElementById('validationResult').innerText = "";
  document.getElementById('codeInputA').value = "";
  document.getElementById('codeInputB').value = ""; // le textarea B reste visible

  document.getElementById('currentTask').innerText = tasks[currentTaskIndex];

  // Rotation codeur
  const codeurA = groups[0][codeurIndex.A % groups[0].length];
  const codeurB = groups[1][codeurIndex.B % groups[1].length];
  document.getElementById('codeurA').innerText = codeurA;
  document.getElementById('codeurB').innerText = codeurB;
  codeurIndex.A++;
  codeurIndex.B++;

  let timeLeft = timerDuration;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    let m = Math.floor(timeLeft / 60);
    let s = timeLeft % 60;
    document.getElementById('timerDisplay').innerText =
      `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    if(timeLeft <= 0){
      clearInterval(timerInterval);
      checkBothValidated();
    }
    timeLeft--;
  }, 1000);
}

// -----------------------------
// Évaluer code
// -----------------------------
function evaluateCode(code) {
  const checker = taskCheckers[currentTaskIndex];
  const breakdown = checker(code);
  const checks = Object.keys(breakdown);
  const points = checks.reduce((acc,k)=> acc + (breakdown[k] ? 1 : 0), 0);
  const passed = points === checks.length;
  return {points, passed, breakdown, checksCount: checks.length};
}

// -----------------------------
// Validation du code d'un groupe
// -----------------------------
function validateCode(team) {
    let code;
    if (team === "B") {
        // Réponse fixe pour le groupe B
        code = fixedBResponses[currentTaskIndex];
        document.getElementById('codeInputB').value = code;
    } else {
        code = document.getElementById(`codeInput${team}`).value || "";
    }

    const evalRes = evaluateCode(code);

    // Sauvegarde des résultats
    if (!taskResults[currentTaskIndex]) taskResults[currentTaskIndex] = { A: null, B: null, winner: null };
    taskResults[currentTaskIndex][team] = evalRes;

    // Affichage détaillé des résultats
    let output = `<strong>Résultats Groupe ${team} :</strong><br>`;
    for (const key in evalRes.breakdown) {
        output += `${key} : ${evalRes.breakdown[key] ? "✅" : "❌"}<br>`;
    }
    output += `Points : ${evalRes.points}/${evalRes.checksCount}<br><br>`;
    document.getElementById('validationResult').innerHTML += output;

    // Enregistrement des points
    taskValidation[team] = evalRes.points;

    // Validation automatique de B après A si ce n’est pas déjà fait
    if (team === "A" && !taskValidation.B) {
        validateCode("B");
        return; // Ne pas continuer pour éviter double finalize
    }

    // Si les deux groupes ont validé → finalisation
    if (taskValidation.A !== false && taskValidation.B !== false) {
        finalizeCurrentTask();
    } else {
        document.getElementById('validationResult').innerHTML +=
            `👉 Groupe ${team} a validé, attendre l'autre équipe...<br><br>`;
    }
}
// -----------------------------
// Finalisation de la tâche courante
// -----------------------------
function finalizeCurrentTask() {
    clearInterval(timerInterval);

    // Détermination du gagnant
    let winner;
    if (taskValidation.A > taskValidation.B) winner = "A";
    else if (taskValidation.B > taskValidation.A) winner = "B";
    else winner = "Égalité";

    // Mise à jour des totaux
    groupTotals.A += taskValidation.A;
    groupTotals.B += taskValidation.B;

    // Enregistrement du gagnant pour cette tâche
    taskWinners[currentTaskIndex] = winner;
    taskResults[currentTaskIndex].winner = winner;

    // Affichage avant incrément de l'index
    document.getElementById('validationResult').innerHTML +=
        `🏆 Tâche ${currentTaskIndex + 1} terminée ! Gagnant : Groupe ${winner}<br>`;

    // Passer à la tâche suivante après un petit délai
    setTimeout(() => {
        currentTaskIndex++;
        startTask();
    }, 2000);
}

// -----------------------------
// Timer expiré → validation forcée
// -----------------------------
function checkBothValidated() {
  if(taskValidation.A === false) validateCode("A");
  if(taskValidation.B === false) validateCode("B");
  if(taskValidation.A !== false && taskValidation.B !== false) finalizeCurrentTask();
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

  taskResults.forEach((res,i)=>{
    if(!res) return;
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

  document.getElementById('finalBtn').style.display = 'inline-block';
}

function finalizeExplanation() {
  document.getElementById('recap').innerHTML += "<br>Explication terminée pour tous. Bravo !";
  document.getElementById('finalBtn').style.display = 'none';
}
