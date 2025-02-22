export async function handleAthlete() {
    const signInForm = document.getElementById("signInForm");
    const personIDInput = document.getElementById("personID");
    const personID = localStorage.getItem("personID");
    if (!personID) {
        console.error("personID is missing");
        return;
    }

    if (signInForm) {
        signInForm.style.display = "none";
    }

    // ASIDE'ı görünür yap
    const asideSection = document.getElementById("athleteLeftSection");
    if (asideSection) {
        asideSection.style.display = "block";
    }

    // "Group" linkine event listener ekle
    const groupLink = document.querySelector('a[href="#group"]');
        if (groupLink) {
                groupLink.addEventListener("click", async function (event) {
                    event.preventDefault();

                    let groupHTML = `<h3>Your Group:</h3>`;

                    try {
                        const response = await fetch(`/athlete/groups/${personID}`);
                        if (!response.ok) {
                            throw new Error(response.statusText);
                        }
                        const groupData = await response.json();
                        groupHTML +=`
                            <table border="1" style="width: 100%; text-align: left; border-collapse: collapse;">
                                <tr>
                                    <th>Group ID</th>
                                    <th>Time</th>
                                    <th>Weekdays</th>
                                    <th>Experience Level</th>
                                    <th>Monthly Fee</th>
                                    <th>Sport Hall Location</th>
                                    <th>Coach Name</th>
                                    <th>Sport</th>
                                </tr>
                                <tr>
                                    <td>${groupData.GroupID}</td>
                                    <td>${groupData.Time}</td>
                                    <td>${groupData.WeekDays}</td>
                                    <td>${groupData.ExperienceLevel}</td>
                                    <td>${groupData.MonthlyFee}</td>
                                    <td>${groupData.SportHallLocation}</td>
                                    <td>${groupData.CoachName}</td>
                                    <td>${groupData.sportName}</td>
                                </tr>
                            </table>`
                        ;
                    } catch (error) {
                        console.error("Error fetching athlete group:", error);
                        groupHTML +=` <p>No group</p>`;
                    }

                    updateContainer(`<h2>Welcome, Athlete!</h2>${groupHTML}`);
                    updateGroupsChange(` `);
                    updateAthleteGroupMates(` `);
                    // Athlete Group Mates içeriği

                    let matesHTML = `<ul>`;

                        try {
                            const responseMates = await fetch(`/athlete/groupmates/${personID}`);
                            if (!responseMates.ok) {
                            throw new Error(responseMates.statusText);
                        }
                            const matesData = await responseMates.json();

                            if (matesData.length > 0) {
                            matesData.forEach(mate => {
                            matesHTML += `<li>${mate.Name} ${mate.Surname}</li>`;
                });
                } else {
                        matesHTML += `<li>No groupmates found.</li>`;
                    }
                } catch (error) {
                    console.error("Error fetching athlete groupmates:", error);
                    matesHTML = `<ul><li>Failed to load groupmates.</li></ul>`;
                }

                matesHTML += `</ul>
                    <button id="changeGroupButton">Request to change your group</button>`;

                    updateAthleteGroupMates(`<h4>Athletes of this group:</h4>${matesHTML}`);

                    // Burada buton artık DOM içinde, dolayısıyla event listener eklenebilir
                    const changeGroupButton = document.getElementById("changeGroupButton");
                    if (changeGroupButton) {
                        changeGroupButton.addEventListener("click", async function (event) {
                            event.preventDefault();
                            let groupsHTML =
                                `<table border="1" style="width: 100%; text-align: left; border-collapse: collapse;">
                                    <tr>
                                        <th>ID</th>
                                        <th>Week Days</th>
                                        <th>Time</th>
                                        <th>Level</th>
                                        <th>Location</th>
                                        <th>Coach</th>
                                        <th>Sport</th>
                                        <th></th>
                                    </tr>`
                                    ;

                                    try {
                                    const responseGroup = await fetch(`/get-groups`);
                                    if (!responseGroup.ok) {
                                    throw new Error(responseGroup.statusText);
                                }
                                    const groupData = await responseGroup.json();
                                    if (groupData.length > 0) {
                                    groupData.forEach(group => {
                                    groupsHTML +=`
                                    <tr>
                                    <td>${group.id}</td>
                            <td>${group.days}</td>
                            <td>${group.time}</td>
                            <td>${group.level}</td>
                            <td>${group.sportHallLocation}</td>
                            <td>${group.coachName}</td>
                            <td>${group.sport}</td>
                            <td><button>Request</button></td>
                        </tr>`
                            ;
                        });
                        } else {
                                groupsHTML += `<tr><td colspan="7">No available groups.</td></tr>`;
                            }

                        } catch (err) {
                            console.error("Error fetching groups:", err);
                            groupsHTML = `<tr><td colspan="7">Failed to load groups.</td></tr>`;
                        }

                        groupsHTML += `</table>`;

                            updateGroupsChange(`<h4>Optional Groups:</h4>${groupsHTML}`);


                        });
                    }
                });
    }

    const personalDataLink = document.querySelector('a[href="#personal-data"]');
        if (personalDataLink) {
                personalDataLink.addEventListener("click", async function (event) {
                    event.preventDefault();
                    let personalDataHTML = ` `;
                    const personIDInput = document.getElementById("personID");
                    const personID = personIDInput ? personIDInput.value : null;

                    if (!personID) {
                        console.error("Person ID is missing.");
                        return;
                    }

                    try {
                        const response = await fetch(`/athlete/personal-data/${personID}`);
                        if (!response.ok) {
                            throw new Error("Failed to fetch personal data.");
                        }

                        const personalData = await response.json();

                        personalDataHTML += `
                        <h3>Your Personal Data</h3>
                        <ul>
                            <li><strong>ID:</strong> ${personalData.PersonID}</li>
                            <li><strong>Name:</strong> ${personalData.Name}</li>
                            <li><strong>Surname:</strong> ${personalData.Surname}</li>
                            <li><strong>Birth Date:</strong> ${new Date(personalData.BirthDate * 1000).toLocaleDateString()}</li>
                            <li><strong>Athlete ID:</strong> ${personalData.AthleteID ? personalData.AthleteID : "Not an Athlete"}</li>
                            <li><strong>Password:</strong> ${personalData.Password} <button id="changePasswordButton">Change</button></li>     
                        </ul>`;
                    } catch (error) {
                        console.error("Error fetching personal data:", error);
                    }

                    updateAthleteGroupMates(` `);
                    updateGroupsChange(` `);
                    updateContainer(`<h2>Your personal data:</h2>${personalDataHTML}`);

                    const changePasswordButton = document.getElementById("changePasswordButton");
                    if (changePasswordButton) {
                        changePasswordButton.addEventListener("click", function (event) {
                            event.preventDefault();
                            updateGroupsChange(`
                                <h2>Change Password</h2>
                                <form id="changePasswordForm">
                                    <label for="currentPassword">Current Password</label>
                                    <input type="password" id="currentPassword" required><br>
        
                                    <label for="newPassword">New Password</label>
                                    <input type="password" id="newPassword" required><br>
        
                                    <label for="confirmPassword">Confirm Password</label>
                                    <input type="password" id="confirmPassword" required><br>
        
                                    <button type="submit" id="passwordChangeSubmit">Change Password</button>
                                    <p id="error-message" style="color: red;"></p>
                                </form>`);

                                const changePasswordForm = document.getElementById("changePasswordForm");

                                changePasswordForm.addEventListener("submit", async function (event) {
                                    event.preventDefault(); // Sayfanın yeniden yüklenmesini önle

                                    const personID=document.getElementById("personID").value;
                                    const passwordValue = document.getElementById("password").value;//from sign in page
                                    const currentPassword = document.getElementById("currentPassword").value;
                                    const newPassword = document.getElementById("newPassword").value;
                                    const confirmPassword = document.getElementById("confirmPassword").value;
                                    const errorMessage = document.getElementById("error-message");

                                    if(passwordValue !==currentPassword){
                                        errorMessage.textContent = "Your password is wrong";
                                    }
                                    else if (newPassword !== confirmPassword) {
                                        errorMessage.textContent = "Passwords do not match!";
                                    } else {
                                        errorMessage.textContent = "";
                                        try {
                                            const response = await fetch(`/change-password`, {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ personID, newPassword })
                                            });

                                           // const data = await response.json();
                                            if (response.ok) {
                                                console.log("Password changed successfully!");
                                                alert("Password updated!");
                                            } else {
                                             //   errorMessage.textContent = data.error || "Failed to change password.";
                                            }
                                        } catch (error) {
                                            console.error("Error:", error);
                                            errorMessage.textContent = "An error occurred.";
                                        }
                                       }
                                });
                        });
                    }
                });
        }

        //Tournaments section
    const tournamentLink = document.querySelector('a[href="#tournaments"]');
    if (tournamentLink) {
        tournamentLink.addEventListener("click", async function (event) {
            event.preventDefault();

            const personID = document.getElementById("personID").value; // Fix: Get the value, not the element

            if (!personID) {
                console.error("No person ID provided.");
                return;
            }

            //Athlete's tournaments
            try {
                const response = await fetch(`/athlete/tournaments/${personID}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch tournament data");
                }

                const tournaments = await response.json();

                if (tournaments.length === 0) {
                    updateContainer("<p>No tournaments found for this athlete.</p>");
                    return;
                }

                let tournamentHTML = `<h2>Your Past Tournaments</h2><ul>`;
                tournaments.forEach(tournament => {
                    tournamentHTML += `
                <li>
                    <strong>${tournament.TournamentName}</strong> (ID: ${tournament.TournamentID})<br>
                    Date: ${tournament.TournamentDate} <br>
                    Rank: ${tournament.Rank}
                </li>`;
                });
                tournamentHTML += `</ul>`;

                updateContainer(tournamentHTML);

            } catch (error) {
                console.error("Error fetching tournaments:", error);
                updateContainer("<p>Error loading athlete's tournaments.</p>");
            }


            // Fetch and display future tournaments
            try {
                const response = await fetch(`/athlete/allTournaments`);
                if (!response.ok) {
                    throw new Error("Failed to fetch tournament data");
                }

                const tournaments = await response.json();

                if (tournaments.length === 0) {
                    updateContainer("<p>No upcoming tournaments found.</p>");
                    return;
                }

                let tournamentHTML = `<h2>Upcoming Tournaments</h2><ul>`;
                tournaments.forEach(tournament => {
                    const dateObj = new Date(tournament.Date * 1000); // Convert to milliseconds
                    const formattedDate = dateObj.toLocaleDateString("en-GB"); // "DD/MM/YYYY"

                    tournamentHTML += `
    <li>
        <strong>${tournament.Name}</strong> (ID: ${tournament.Id})<br>
        Date: ${formattedDate}
    </li>`;
                });

                tournamentHTML += `</ul>`;
                updateGroupsChange(tournamentHTML);

            } catch (error) {
                console.error("Error fetching tournaments:", error);
                updateGroupsChange("<p>Error loading upcoming tournaments.</p>");
            }
            updateAthleteGroupMates(` `);
        });
    }

    const paymentsLink = document.querySelector('a[href="#payments"]');
    if (paymentsLink) {
        paymentsLink.addEventListener("click", async function (event) {
            event.preventDefault();
            const personID = document.getElementById("personID").value; // Fix: Get the value, not the element

            if (!personID) {
                console.error("No person ID provided.");
                return;
            }

            let totalMoney=0;
            try {
                const response = await fetch(`/athlete/payments/${personID}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch tournament data");
                }

                const payments = await response.json();

                if (payments.length === 0) {
                    updateContainer("<p>No tournaments found for this athlete.</p>");
                    return;
                }



                let paymentHTML = `<h2>Your Past Tournaments</h2><ul>`;
                payments.forEach(payment => {
                    totalMoney+=payment.Amount;
                    paymentHTML += `
                <li>
                    <strong>ID: ${payment.Id}</strong><br>
                    Date: ${payment.Date} <br>
                    Rank: ${payment.Amount}<br>
                    Amount: ${payment.Description}<br>
                </li>`;
                });
                paymentHTML += `</ul>`;

                updateContainer(paymentHTML);
                updateGroupsChange(`<h5>Total Amount: ${totalMoney}</h5>`);

            }
            catch (error){
                console.error("Error fetching payments:", error);
                updateContainer("<p>Error loading athlete's payments.</p>");
            }
            updateAthleteGroupMates(` `);
            //updateGroupsChange(` `);
        });
    }














    function updateContainer(content){
        const container = document.getElementById("container");
        if (container) {
            container.innerHTML = content;
        }
    }

    function updateAthleteGroupMates(content){
        const athleteGroupMates = document.getElementById("athleteGroupMates");
        if (athleteGroupMates) {
            athleteGroupMates.innerHTML = content;
        }
    }

    function updateGroupsChange(content){
        const athleteGroupsChange = document.getElementById("groupsChange");
        if (athleteGroupsChange) {
            athleteGroupsChange.innerHTML = content;
        }
    }


}