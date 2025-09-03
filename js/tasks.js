// Les 3 tâches du projet argc/argv
export const tasks = [
    "0. Write a program that prints its name, followed by a new line.\nThe program name may change without recompilation.",
    "1. Write a program that prints the number of arguments passed into it.",
    "2. Write a program that prints all arguments it receives, one per line."
];

export let currentTaskIndex = 0;
export let codeurIndex = {A:0, B:0};
export let taskValidation = {A:false, B:false};
export let taskWinners = []; // stocke qui a gagné chaque tâche

// Démarrer tâche courante
export function startTask(groups){
    if(currentTaskIndex >= tasks.length){
        document.getElementById('currentTask').innerText = "Toutes les tâches terminées !";
        document.getElementById('timerDisplay').innerText = "00:00";
        return true; // Indique que toutes les tâches sont terminées
    }

    taskValidation = {A:false, B:false};
    document.getElementById('validationResult').innerText = "";
    document.getElementById('codeInputA').value="";
    document.getElementById('codeInputB').value="";

    document.getElementById('currentTask').innerText = tasks[currentTaskIndex];

    // Rotation codeur
    const codeurA = groups[0][codeurIndex.A % groups[0].length];
    const codeurB = groups[1][codeurIndex.B % groups[1].length];
    document.getElementById('codeurA').innerText = codeurA;
    document.getElementById('codeurB').innerText = codeurB;
    codeurIndex.A++;
    codeurIndex.B++;

    return false; // Indique qu'il reste des tâches
}

// Validation du code pour un groupe
export function validateCode(team){
    taskValidation[team]=true;

    if(taskValidation.A && taskValidation.B){
        const winner = Math.random()>0.5 ? 'A':'B';
        taskWinners[currentTaskIndex] = winner;
        document.getElementById('validationResult').innerHTML = 
            `<span style="font-size: 1.2rem;">Tâche ${currentTaskIndex+1} terminée !</span><br>Gagnant : <span style="color: ${winner === 'A' ? '#3498db' : '#e74c3c'}">Groupe ${winner}</span>`;
        currentTaskIndex++;
        return true; // Indique que la tâche est terminée
    } else {
        document.getElementById('validationResult').innerText = `Groupe ${team} a validé, en attente de l'autre équipe...`;
        return false; // Indique qu'on attend encore l'autre équipe
    }
}

// Vérifier les validations forcées si le timer expire
export function checkBothValidated(){
    if(!taskValidation.A) taskValidation.A = true;
    if(!taskValidation.B) taskValidation.B = true;
    return validateCode('A'); // déclenche validation globale
}

// Affichage récap et explication finale
export function displayRecap(){
    const recapDiv = document.getElementById('recap');
    recapDiv.innerHTML = "";
    tasks.forEach((task,i)=>{
        const line = document.createElement('div');
        line.className = "task-line";
        const winner = taskWinners[i];
        line.innerHTML = `<strong>Tâche ${i}:</strong> ${winner ? 
            '<span style="color:#2ecc71">Comprise!</span>' : 
            '<span style="color:#e74c3c">À revoir</span>'}<br>${task}`;
        recapDiv.appendChild(line);
    });
    document.getElementById('finalBtn').style.display = 'block';
}