// Select the Guest button
const guestButton = document.getElementById("guestButton");

// Event listener for Guest button click
guestButton.addEventListener("click", () => {
    // Clear the formContainer to avoid duplicating content
    formContainer.innerHTML = `
        <h2>Welcome, Guest!</h2>
        <p>Explore the Sport Club's general information below.</p>
    `;

    // Fetch and display training groups
    fetch('/guest-groups')
        .then((response) => response.json())
        .then((groups) => {
            let groupsHTML = '<h3>All Training Groups:</h3>';
            groups.forEach((group) => {
                groupsHTML += `
                    <div class="training-group">
                        <p><strong>Location:</strong> ${group.location || 'Not specified'}</p>
                        <p><strong>Days:</strong> ${group.days || 'Not specified'}</p>
                        <p><strong>Time:</strong> ${group.time || 'Not specified'}</p>
                        <p><strong>Level:</strong> ${group.level || 'Not specified'}</p>
                        <p><strong>Fee:</strong> ${group.fee || 'Not specified'}</p>
                        <p><strong>Coach:</strong> ${group.coach || 'Not specified'}</p>
                    </div>
                    <hr />
                `;
            });
            formContainer.innerHTML += groupsHTML;

            // Fetch and display coaches after groups
            fetch('/guest-coaches')
                .then((response) => response.json())
                .then((coaches) => {
                    let coachesHTML = '<h3>All Coaches:</h3>';
                    coaches.forEach((coach) => {
                        coachesHTML += `
                            <div class="coach-info">
                                <p><strong>Name:</strong> ${coach.name || 'Not specified'}</p>
                                <p><strong>Surname:</strong> ${coach.surname || 'Not specified'}</p>
                                <p><strong>Coaching since:</strong> ${coach.time || 'Not specified'}</p>
                                <p><strong>Successes:</strong> ${coach.success || 'Not specified'}</p>
                            </div>
                            <hr />
                        `;
                    });
                    formContainer.innerHTML += coachesHTML;

                    // Fetch and display sport halls after coaches
                    fetch('/guest-sporthalls')
                        .then((response) => response.json())
                        .then((sporthalls) => {
                            let sporthallsHTML = '<h3>All Sport Halls:</h3>';
                            sporthalls.forEach((sporthall) => {
                                sporthallsHTML += `
                                    <div class="sporthall-info">
                                        <p><strong>ID:</strong> ${sporthall.id || 'Not specified'}</p>
                                        <p><strong>Location:</strong> ${sporthall.loc || 'Not specified'}</p>
                                    </div>
                                    <hr />
                                `;
                            });
                            formContainer.innerHTML += sporthallsHTML;
                        })
                        .catch((error) => {
                            console.error('Error fetching sport halls:', error);
                            formContainer.innerHTML += '<p>Could not load sport halls.</p>';
                        });
                })
                .catch((error) => {
                    console.error('Error fetching coaches:', error);
                    formContainer.innerHTML += '<p>Could not load coaches.</p>';
                });
        })
        .catch((error) => {
            console.error('Error fetching training groups:', error);
            formContainer.innerHTML += '<p>Could not load training groups.</p>';
        });
});
