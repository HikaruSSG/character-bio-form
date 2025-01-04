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

// Function to delete a relation
function deleteRelation(button) {
    const relationDiv = button.parentNode;
    const relationsContainer = document.getElementById('relationsContainer');
    relationsContainer.removeChild(relationDiv);
}

// Function to add a new hobby
function addHobby() {
    const hobbiesContainer = document.getElementById('hobbiesContainer');
    const newHobbyDiv = document.createElement('div');
    newHobbyDiv.innerHTML = `
        <input type="text" name="hobby[]" placeholder="Hobby" value="">
        <button type="button" onclick="deleteHobby(this)">Delete</button>
    `;
    hobbiesContainer.appendChild(newHobbyDiv);
}

// Function to delete a hobby
function deleteHobby(button) {
    const hobbyDiv = button.parentNode;
    const hobbiesContainer = document.getElementById('hobbiesContainer');
    hobbiesContainer.removeChild(hobbyDiv);
}

// Function to fetch all bios from the server and display them, and handle form submission/download
function fetchBios() {
    fetch('/get-bios')
        .then(response => response.json())
        .then(bios => {
            console.log('All bios:', bios);
            displayBios(bios);
        });
}

// Function to display bios on the page
function displayBios(bios) {
    const biosListDiv = document.getElementById('biosList');
    biosListDiv.innerHTML = ''; // Clear existing list
    bios.forEach(bio => {
        const bioDiv = document.createElement('div');
        bioDiv.innerHTML = `
            <h3>${bio.name}</h3>
            <p>Age: ${bio.age}</p>
            <p>Occupation: ${bio.occupation}</p>
            <p>Personality: ${bio.personality}</p>
            <p>Hobbies: ${bio.hobbies.join(', ')}</p>
            <p>Story: ${bio.story}</p>
            <p>Relation to You: ${bio.relationToYou}</p>
            ${bio.otherRelations.map(rel => `<p>Relation: ${rel.character} is ${rel.relation}</p>`).join('')}
            <hr/>
        `;
        biosListDiv.appendChild(bioDiv);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const characterBioForm = document.getElementById('characterBioForm');
    const relationsContainer = document.getElementById('relationsContainer');
    const hobbiesTextarea = document.getElementById('hobbies-textarea');
    const hobbiesShortDiv = document.getElementById('hobbies-short');
    const hobbiesFullDiv = document.getElementById('hobbies-full');
    const showMoreButton = document.getElementById('show-more-hobbies');
    const addHobbyButton = document.getElementById('add-hobby-button');
    const newHobbyInput = document.getElementById('new-hobby');
    const biosListDiv = document.getElementById('biosList');

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

    // Handle download single bio button
    document.getElementById('downloadBio').addEventListener('click', function() {
        const formData = new FormData(characterBioForm);
        const bio = {
            name: formData.get('name'),
            age: formData.get('age'),
            occupation: formData.get('occupation'),
            personality: formData.get('personality'),
            hobbies: [],
            story: formData.get('story'),
            relationToYou: formData.get('relationToYou'),
            otherRelations: [],
            gender: formData.get('gender')
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

        const jsonString = JSON.stringify(bio, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'characterBio.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
