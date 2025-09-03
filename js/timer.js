export let timerDuration = 5*60; // 5 minutes
export let timerInterval;

export function startTimer(callback) {
    let timeLeft = timerDuration;
    clearInterval(timerInterval);
    
    // Réinitialiser la couleur du timer
    document.getElementById('timerDisplay').style.color = '';
    document.getElementById('timerDisplay').style.textShadow = '';
    
    timerInterval = setInterval(() => {
        let m = Math.floor(timeLeft/60);
        let s = timeLeft%60;
        document.getElementById('timerDisplay').innerText = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        
        // Changement de couleur quand le temps est presque écoulé
        if(timeLeft <= 60) {
            document.getElementById('timerDisplay').style.color = '#e74c3c';
            document.getElementById('timerDisplay').style.textShadow = '0 0 10px rgba(231, 76, 60, 1)';
        }
        
        if(timeLeft <= 0){
            clearInterval(timerInterval);
            if (callback) callback();
        }
        timeLeft--;
    }, 1000);
}

export function stopTimer() {
    clearInterval(timerInterval);
}

export function resetTimer() {
    clearInterval(timerInterval);
    document.getElementById('timerDisplay').innerText = "05:00";
    document.getElementById('timerDisplay').style.color = '';
    document.getElementById('timerDisplay').style.textShadow = '';
}