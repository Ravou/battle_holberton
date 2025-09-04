// Liste des étudiants
export const students = ["Alice", "Bob", "Charlie", "Diana", "Ethan", "Fiona", "George", "Hannah", "Igor"];

// Affichage étudiants
export function displayStudents() {
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = students.map(s => 
        `<div class="student-card">${s}</div>`
    ).join('');
}