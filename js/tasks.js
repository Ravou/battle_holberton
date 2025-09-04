// Liste des étudiants
export const students = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah", "Igor"];

// Les tâches
export const tasks = [
  "0. Write a program that prints its name, followed by a new line.\nThe program name may change without recompilation.",
  "1. Write a program that prints the number of arguments passed into it.",
  "2. Write a program that prints all arguments it receives, one per line."
];

// Solutions de référence (juste pour info / affichage)
export const taskCheckerCode = [
`#include <stdio.h>
int main(int argc, char *argv[])
{
    (void)argc;
    printf("%s\\n", argv[0]);
    return (0);
}`,
`#include <stdio.h>
int main(int argc, char *argv[])
{
    (void)argv;
    printf("%d\\n", argc - 1);
    return (0);
}`,
`#include <stdio.h>
int main(int argc, char *argv[])
{
    int i;
    (void)argc;
    for (i = 0; i < argc; i++)
        printf("%s\\n", argv[i]);
    return (0);
}`
];

// Checkers = ce qui valide le code soumis
export const taskCheckers = [
    // Task 0
    (code) => ({
        "Correct output - case: ./0-whatsmyname_0": code.includes("printf") && code.includes("argv[0]"),
        "Correct output - case: ./anothername": code.includes("printf") && code.includes("argv[0]"),
        "Correct output - case: ./AreYouSure?": code.includes("printf") && code.includes("argv[0]"),
        "Return SUCCESS": code.includes("return (0)"),
        "Betty coding style": !code.includes("\t")
    }),
    // Task 1
    (code) => ({
        "Correct output - case: ./1-args": code.includes("argc - 1") || code.includes("printf"),
        "Return SUCCESS": code.includes("return 0"),
        "Betty coding style": !code.includes("\t")
    }),
    // Task 2
    (code) => ({
        "Correct output - case: ./task": code.includes("for") && code.includes("printf"),
        "Return SUCCESS": code.includes("return 0"),
        "Betty coding style": !code.includes("\t")
    })
];

// Variables d'état des tâches
export let currentTaskIndex = 0;
export let codeurIndex = {A:0, B:0};
export let taskValidation = {A:false, B:false};
export let taskWinners = [];
export let groupTotals = {A:0, B:0};
export let taskResults = [];

// Réponses fixes pour B, dans l'ordre des tâches
export const fixedBResponses = [
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

// Évaluer code
export function evaluateCode(code) {
  const checker = taskCheckers[currentTaskIndex];
  const breakdown = checker(code);
  const checks = Object.keys(breakdown);
  const points = checks.reduce((acc,k)=> acc + (breakdown[k] ? 1 : 0), 0);
  const passed = points === checks.length;
  return {points, passed, breakdown, checksCount: checks.length};
}

// Démarrer tâche courante
export function startTask(groups){
    if(currentTaskIndex >= tasks.length){
        document.getElementById('currentTask').innerText = "Toutes les tâches terminées !";
        document.getElementById('timerDisplay').innerText = "00:00";
        return true; // Indique que toutes les tâches sont terminées
    }

    taskValidation = {A:false, B:false};
    document.getElementById('validationResult').innerText = "";
    document.getElementById('codeInputA').value = "";
    // Plus besoin de vider le textarea B car il n'est plus affiché

    document.getElementById('currentTask').innerText = tasks[currentTaskIndex];

    // Rotation codeur - seulement pour le Groupe A
    const codeurA = groups[0][codeurIndex.A % groups[0].length];
    document.getElementById('codeurA').innerText = codeurA;
    codeurIndex.A++;

    return false; // Indique qu'il reste des tâches
}

// Validation du code pour un groupe
export function validateCode(team) {
    let code;
    if (team === "B") {
        // Réponse fixe pour le groupe B (toujours utilisé en arrière-plan)
        code = fixedBResponses[currentTaskIndex];
        // Plus besoin de mettre à jour le textarea B car il n'est plus affiché
    } else {
        code = document.getElementById(`codeInput${team}`).value || "";
    }

    const evalRes = evaluateCode(code);

    // Sauvegarde des résultats
    if (!taskResults[currentTaskIndex]) taskResults[currentTaskIndex] = { A: null, B: null, winner: null };
    taskResults[currentTaskIndex][team] = evalRes;

    // Affichage détaillé des résultats seulement pour le Groupe A
    if (team === "A") {
        let output = `<strong>Résultats Groupe ${team} :</strong><br>`;
        for (const key in evalRes.breakdown) {
            output += `${key} : ${evalRes.breakdown[key] ? "✅" : "❌"}<br>`;
        }
        output += `Points : ${evalRes.points}/${evalRes.checksCount}<br><br>`;
        document.getElementById('validationResult').innerHTML += output;
    }

    // Enregistrement des points
    taskValidation[team] = evalRes.points;

    // Validation automatique de B après A si ce n'est pas déjà fait
    if (team === "A" && !taskValidation.B) {
        validateCode("B");
        return false; // Ne pas continuer pour éviter double finalize
    }

    // Si les deux groupes ont validé → finalisation
    if (taskValidation.A !== false && taskValidation.B !== false) {
        return true; // Indique que la tâche est terminée
    } else if (team === "A") {
        document.getElementById('validationResult').innerHTML +=
            `👉 En attente de l'évaluation de l'autre équipe...<br><br>`;
        return false; // Indique qu'on attend encore l'autre équipe
    }
    
    return false;
}

// Finalisation de la tâche courante
export function finalizeCurrentTask() {
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
    
    currentTaskIndex++;
}

// Vérifier les validations forcées si le timer expire
export function checkBothValidated() {
    if(taskValidation.A === false) validateCode("A");
    if(taskValidation.B === false) validateCode("B");
    if(taskValidation.A !== false && taskValidation.B !== false) {
        finalizeCurrentTask();
        return true;
    }
    return false;
}

// Affichage récap et explication finale
export function displayRecap(){
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

    document.getElementById('finalBtn').style.display = 'block';
}

// Fonction pour finaliser les explications
export function finalizeExplanation(){
    document.getElementById('recap').innerHTML += "<br>Explication terminée pour tous. Bravo !";
    document.getElementById('finalBtn').style.display = 'none';
}