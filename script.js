// Adds a new relation input field to the form.
function addRelation() {
    const relationsContainer = document.getElementById('relationsContainer');
    const newRelationDiv = document.createElement('div');
    newRelationDiv.innerHTML = `
        <input type="text" name="otherCharacter[]" placeholder="Character Name">
        <input type="text" name="relation[]" placeholder="Relation">
        <button type="button" onclick="deleteRelation(this)">Delete</button>
    `;
    relationsContainer.appendChild(newRelationDiv);
}

// Deletes a relation input field from the form.
// @param {HTMLButtonElement} button - The button that was clicked to delete the relation.
function deleteRelation(button) {
    const relationDiv = button.parentNode;
    const relationsContainer = document.getElementById('relationsContainer');
    relationsContainer.removeChild(relationDiv);
}

// Adds a new hobby input field to the form.
function addHobby() {
    const hobbiesContainer = document.getElementById('hobbiesContainer');
    const newHobbyDiv = document.createElement('div');
    newHobbyDiv.innerHTML = `
        <input type="text" name="hobby[]" placeholder="Hobby" value="">
        <button type="button" onclick="deleteHobby(this)">Delete</button>
    `;
    hobbiesContainer.appendChild(newHobbyDiv);
}

// Deletes a hobby input field from the form.
// @param {HTMLButtonElement} button - The button that was clicked to delete the hobby.
function deleteHobby(button) {
    const hobbyDiv = button.parentNode;
    const hobbiesContainer = document.getElementById('hobbiesContainer');
    hobbiesContainer.removeChild(hobbyDiv);
}

// Fetches all character bios from the server and displays them on the page.
function fetchBios() {
    fetch('/get-bios')
        .then(response => response.json())
        .then(bios => {
            console.log('All bios:', bios);
            displayBios(bios);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    const characterBioForm = document.getElementById('characterBioForm');
    const hobbiesTextarea = document.getElementById('hobbies-textarea');
    const hobbiesShortDiv = document.getElementById('hobbies-short');
    const hobbiesFullDiv = document.getElementById('hobbies-full');
    const showMoreButton = document.getElementById('show-more-hobbies');

    // Handle form submission
    characterBioForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(characterBioForm);
        const bio = {
            name: formData.get('name'),
            age: formData.get('age'),
            gender: formData.get('gender'),
            occupation: formData.get('occupation'),
            personality: formData.get('personality'),
            hobbies: [],
            story: formData.get('story'),
            relationToYou: formData.get('relationToYou'),
            otherRelations: []
        };

        const hobbyInputs = document.querySelectorAll('#hobbiesContainer input[name="hobby[]"]');
        hobbyInputs.forEach(input => {
            bio.hobbies.push(input.value);
        });

        const otherCharacters = formData.getAll('otherCharacter[]');
        const relations = formData.getAll('relation[]');

        for (let i = 0; i < otherCharacters.length; i++) {
            if (otherCharacters[i] && relations[i]) {
                bio.otherRelations.push({
                    character: otherCharacters[i],
                    relation: relations[i]
                });
            }
        }

        // Send the bio data to the server
        fetch('/save-bio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bio)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Bio saved:', data);
            // Optionally, update the UI to show a success message
            fetchBios(); // Refresh the list of bios
        });
    });

    // Initialize the full hobbies textarea and handle show more
    let hobbies = hobbiesTextarea.value.split('\\n').filter(hobby => hobby.trim() !== '');
    const initialHobbies = hobbies.slice(0, 3);
    hobbiesShortDiv.textContent = initialHobbies.join(', ');

    if (hobbies.length <= 3) {
        showMoreButton.style.display = 'none';
    }

    showMoreButton.addEventListener('click', function() {
        hobbiesShortDiv.style.display = 'none';
        hobbiesFullDiv.style.display = 'block';
        showMoreButton.style.display = 'none';
    });

    hobbiesTextarea.value = hobbies.join('\\n');

    fetchBios();
});
