import { students, displayStudents } from './students.js';
import { groups, formGroups } from './groups.js';
import { 
    tasks, 
    currentTaskIndex, 
    codeurIndex, 
    taskValidation, 
    taskWinners, 
    startTask, 
    validateCode, 
    checkBothValidated, 
    displayRecap 
} from './tasks.js';
import { startTimer, stopTimer, resetTimer } from './timer.js';

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    displayStudents();
    
    // Ajout des écouteurs d'événements
    document.getElementById('formGroupsBtn').addEventListener('click', handleFormGroups);
    document.getElementById('validateA').addEventListener('click', () => handleValidateCode('A'));
    document.getElementById('validateB').addEventListener('click', () => handleValidateCode('B'));
    document.getElementById('finalBtn').addEventListener('click', finalizeExplanation);
});

function handleFormGroups() {
    const formedGroups = formGroups();
    if (formedGroups.length >= 2) {
        startTask(formedGroups);
        startTimer(() => {
            checkBothValidated();
            setTimeout(() => {
                if (currentTaskIndex < tasks.length) {
                    startTask(formedGroups);
                    startTimer(() => checkBothValidated());
                }
            }, 2000);
        });
    }
}

function handleValidateCode(team) {
    const isTaskComplete = validateCode(team);
    if (isTaskComplete) {
        stopTimer();
        setTimeout(() => {
            const allTasksComplete = startTask(groups);
            if (allTasksComplete) {
                displayRecap();
            } else {
                startTimer(() => checkBothValidated());
            }
        }, 2000);
    }
}

// Bouton final pour terminer explication
function finalizeExplanation(){
    document.getElementById('recap').innerHTML += "<br><div class='task-line' style='background:rgba(46,204,113,0.3)'>Explication terminée pour tous. Bravo !</div>";
    document.getElementById('finalBtn').style.display = 'none';
}