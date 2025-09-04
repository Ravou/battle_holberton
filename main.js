// -----------------------------
// Variables globales
// -----------------------------
let groups = [];
let currentTaskIndex = 0;
let timerDuration = 5 * 60; // 5 min
let timerInterval;
let codeurIndex = { A: 0, B: 0 };
let taskValidation = { A: 0, B: 0 }; // points validés par tâche
let taskWinners = [];
let groupTotals = { A: 0, B: 0 }; // total score du groupe
let taskResults = [];
let hasLostFocus = false; // pour gérer la pénalité correctement
let pendingPenalty = { A: 0, B: 0 }; // pénalités en attente pour la tâche

// Réponses fixes pour B
const fixedBResponses = [
`#include <stdio.h>
int main() {
    printf("Hello\\n");
    return 0;
}`,
`#include <stdio.h>
int main(int argc, char *argv[]) {
    
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

  taskValidation = {A:0, B:0};
  document.getElementById('validationResult').innerText = "";
  document.getElementById('codeInputA').value = "";
  document.getElementById('codeInputB').value = "";

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
        code = fixedBResponses[currentTaskIndex];
        document.getElementById('codeInputB').value = code;
    } else {
        code = document.getElementById(`codeInput${team}`).value || "";
    }

    const evalRes = evaluateCode(code);

    if (!taskResults[currentTaskIndex]) 
        taskResults[currentTaskIndex] = { A: null, B: null, winner: null, penalties: {A:0, B:0} };

    taskResults[currentTaskIndex][team] = evalRes;

    // Stocker les points validés
    taskValidation[team] = evalRes.points;

    let output = `<strong>Résultats Groupe ${team} :</strong><br>`;
    for (const key in evalRes.breakdown) {
        output += `${key} : ${evalRes.breakdown[key] ? "✅" : "❌"}<br>`;
    }
    output += `Points : ${evalRes.points}/${evalRes.checksCount}<br><br>`;
    document.getElementById('validationResult').innerHTML += output;

    if (team === "A" && taskValidation.B === 0) {
        validateCode("B");
        return;
    }

    if (taskValidation.A !== null && taskValidation.B !== null) {
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

    let winner;
    if (taskValidation.A > taskValidation.B) winner = "A";
    else if (taskValidation.B > taskValidation.A) winner = "B";
    else winner = "Égalité";

    const pointsA = Number(taskValidation.A) || 0;
    const pointsB = Number(taskValidation.B) || 0;

    // Appliquer pénalités et mettre à jour le score total
    const finalA = Math.max(0, pointsA - pendingPenalty.A);
    const finalB = Math.max(0, pointsB - pendingPenalty.B);

    groupTotals.A += finalA;
    groupTotals.B += finalB;

    // Stocker les pénalités et points finaux pour le récap
    taskResults[currentTaskIndex].winner = winner;
    taskResults[currentTaskIndex].penalties = { A: pendingPenalty.A, B: pendingPenalty.B };
    taskResults[currentTaskIndex].finalPoints = { A: finalA, B: finalB };

    // Réinitialiser les pénalités pour la prochaine tâche
    pendingPenalty.A = 0;
    pendingPenalty.B = 0;

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
  if(taskValidation.A === 0) validateCode("A");
  if(taskValidation.B === 0) validateCode("B");
  if(taskValidation.A !== null && taskValidation.B !== null) finalizeCurrentTask();
}

// -----------------------------
// Pénalité si Groupe A quitte la fenêtre
// -----------------------------
function applyPenalty(team) {
    pendingPenalty[team]++;
    showPenaltyAlert(`⚠️ Groupe ${team} a reçu une pénalité !`);
}

// -----------------------------
// Alertes de pénalité
// -----------------------------
function showPenaltyAlert(message) {
    let alertDiv = document.getElementById("penaltyAlert");
    if (!alertDiv) {
        alertDiv = document.createElement("div");
        alertDiv.id = "penaltyAlert";
        alertDiv.className = "penalty-alert";
        document.body.appendChild(alertDiv);
    }
    alertDiv.innerText = message;
    alertDiv.style.display = "block";
    setTimeout(() => {
        alertDiv.style.display = "none";
    }, 3000);
}

// -----------------------------
// Détection perte de focus / changement d’onglet
// -----------------------------
window.addEventListener("load", () => {
    document.addEventListener("visibilitychange", () => {
        if (document.hidden && !hasLostFocus) {
            applyPenalty("A");
            hasLostFocus = true;
        } else if (!document.hidden) {
            hasLostFocus = false;
        }
    });
});

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
    const penalties = res.penalties || {A:0,B:0};
    const finalPts = res.finalPoints || {A:0,B:0};
    const title = tasks[i].split("\n")[0];
    const line = document.createElement('div');
    line.className = "task-line";
    line.innerHTML = `
      <strong>Tâche ${i} — ${title}</strong><br>
      Groupe A : ${a ? (a.passed ? "✅" : "❌") : "—"} ${a ? `${a.points}/${a.checksCount} points` : ""} 
      ${penalties.A>0?`(-${penalties.A} pénalité)`:""}<br>
      Points : ${finalPts.A}<br>
      Groupe B : ${b ? (b.passed ? "✅" : "❌") : "—"} ${b ? `${b.points}/${b.checksCount} points` : ""} 
      ${penalties.B>0?`(-${penalties.B} pénalité)`:""}<br>
      Points : ${finalPts.B}<br>
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
