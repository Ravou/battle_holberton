import { students, displayStudents } from './students.js';
import { groups, formGroups } from './groups.js';
import { 
    tasks, 
    currentTaskIndex, 
    codeurIndex, 
    taskValidation, 
    taskWinners, 
    groupTotals,
    taskResults,
    startTask, 
    validateCode, 
    checkBothValidated, 
    finalizeCurrentTask,
    displayRecap,
    finalizeExplanation
} from './tasks.js';
import { startTimer, stopTimer, resetTimer } from './timer.js';

// Variables globales
let timerInterval;
let timerDuration = 5 * 60;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    displayStudents();
    
    // Ajout des écouteurs d'événements
    document.getElementById('formGroupsBtn').addEventListener('click', handleFormGroups);
    document.getElementById('validateA').addEventListener('click', () => handleValidateCode('A'));
    document.getElementById('finalBtn').addEventListener('click', finalizeExplanation);
});

function handleFormGroups() {
    const formedGroups = formGroups();
    if (formedGroups.length >= 2) {
        const allTasksComplete = startTask(formedGroups);
        if (!allTasksComplete) {
            // Valider automatiquement le code du Groupe B
            setTimeout(() => {
                validateCode("B");
            }, 1000);
            
            startTimerFunction();
        } else {
            displayRecap();
        }
    }
}

function startTimerFunction() {
    let timeLeft = timerDuration;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        let m = Math.floor(timeLeft / 60);
        let s = timeLeft % 60;
        document.getElementById('timerDisplay').innerText =
            `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        
        // Changement de couleur quand le temps est presque écoulé
        if(timeLeft <= 60) {
            document.getElementById('timerDisplay').style.color = '#FF2A2A';
            document.getElementById('timerDisplay').style.textShadow = '0 0 10px rgba(255, 42, 42, 1)';
        }
        
        if(timeLeft <= 0){
            clearInterval(timerInterval);
            checkBothValidated();
        }
        timeLeft--;
    }, 1000);
}

function handleValidateCode(team) {
    const isTaskComplete = validateCode(team);
    if (isTaskComplete) {
        clearInterval(timerInterval);
        finalizeCurrentTask();
        setTimeout(() => {
            const allTasksComplete = startTask(groups);
            if (allTasksComplete) {
                displayRecap();
            } else {
                // Valider automatiquement le code du Groupe B pour la tâche suivante
                setTimeout(() => {
                    validateCode("B");
                }, 1000);
                startTimerFunction();
            }
        }, 2000);
    }
}