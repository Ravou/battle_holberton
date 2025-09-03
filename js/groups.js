import { students } from './tasks.js';

export let groups = [];

// Former groupes
export function formGroups() {
    let copy = [...students];
    groups = [];
    while(copy.length > 1){
        const i1 = Math.floor(Math.random()*copy.length);
        const p1 = copy.splice(i1,1)[0];
        const i2 = Math.floor(Math.random()*copy.length);
        const p2 = copy.splice(i2,1)[0];
        groups.push([p1,p2]);
    }
    if(copy.length === 1){
        if(groups.length>0){
            groups[groups.length-1].push(copy[0]);
        } else {
            groups.push([copy[0]]);
        }
    }
    
    const groupsList = document.getElementById('groupsList');
    // Afficher seulement le Groupe A
    groupsList.innerHTML = `
        <div class="group-card">
            <h3>Groupe A</h3>
            <p>${groups[0].join(' & ')}</p>
        </div>
    `;
    
    return groups;
}