document.addEventListener('DOMContentLoaded', () => {
    const profileContainer = document.getElementById('profile-container');

    fetch('profiles.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(profile => {
            // Create image element
            const profileImage = document.createElement('img');
            profileImage.src = profile.profile_picture_url;
            profileImage.alt = `Profile picture of ${profile.name}`;

            // Create info container
            const infoDiv = document.createElement('div');
            infoDiv.classList.add('profile-info');

            // Create name element
            const nameEl = document.createElement('h1');
            nameEl.textContent = `${profile.name}, ${profile.age}`;

            // Create location element
            const locationEl = document.createElement('p');
            locationEl.classList.add('location');
            locationEl.textContent = profile.location;

            // Create bio element
            const bioEl = document.createElement('p');
            bioEl.classList.add('bio');
            bioEl.textContent = profile.bio;

            // Create interests list
            const interestsList = document.createElement('ul');
            interestsList.classList.add('interests');
            profile.interests.forEach(interestText => {
                const interestItem = document.createElement('li');
                interestItem.textContent = interestText;
                interestsList.appendChild(interestItem);
            });

            // Append elements to the info container
            infoDiv.appendChild(nameEl);
            infoDiv.appendChild(locationEl);
            infoDiv.appendChild(bioEl);
            infoDiv.appendChild(interestsList);

            // Append image and info to the main container
            profileContainer.appendChild(profileImage);
            profileContainer.appendChild(infoDiv);
        })
        .catch(error => {
            console.error('Error fetching or displaying profile data:', error);
            profileContainer.textContent = 'Could not load profile data.';
        });
});
