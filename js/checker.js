function validateCode(team){
    const code = document.getElementById(`codeInput${team}`).value;
    const checker = taskCheckers[currentTaskIndex];
    const results = checker(code);

    // Score calculé avec le checker
    let output = `Résultats pour Groupe ${team} :\n`;
    let points = 0;
    for (const key in results){
        output += `${key} : ${results[key] ? "✔️" : "❌"}\n`;
        if (results[key]) points += (key.includes("AreYouSure?") ? 2 : 1);
    }
    output += `Points : ${points}\n`;
    document.getElementById('validationResult').innerText += output + "\n";

    // Sauvegarde des points pour ce groupe
    taskValidation[team] = points;

    // Quand les deux groupes ont soumis
    if(taskValidation.A !== false && taskValidation.B !== false){
        let winner;
        if(taskValidation.A > taskValidation.B) winner = "A";
        else if(taskValidation.B > taskValidation.A) winner = "B";
        else winner = "Égalité";

        document.getElementById('validationResult').innerText += 
            `\nTâche ${currentTaskIndex+1} terminée ! Gagnant : Groupe ${winner}`;

        taskWinners[currentTaskIndex] = winner;

        // Passer à la tâche suivante après 2 secondes
        setTimeout(()=>{
            currentTaskIndex++;
            startTask();
        },2000);
    } else {
        document.getElementById('validationResult').innerText += 
            `\nGroupe ${team} a validé, attendre l'autre équipe...\n`;
    }
}