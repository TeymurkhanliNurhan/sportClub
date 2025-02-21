const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./database'); // database.js dosyasını burada import edin
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3003;



// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..','public')));
// Anasayfa için GET isteği
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..','public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});



// SignIn section
app.post('/signInStart', (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        return res.status(400).json({ error: "ID and password are required!" });
    }

    db.get(`SELECT * FROM Person WHERE Id = ?`, [id], (err, person) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!person) return res.status(404).json({ error: "ID does not exist!" });

        // Önce şifreyi kontrol et
        if (person.Password !== password) {
            return res.status(401).json({ error: "Incorrect password!" });
        }

        // Şifre doğruysa rolü belirle
        db.get(`SELECT * FROM Athlete WHERE PersonId = ?`, [id], (err, athlete) => {
            if (athlete) {
                console.log("User role:", "athlete");  // Terminale yazdır
                return res.json({ role: "athlete" });
            }

            db.get(`SELECT * FROM Coach WHERE PersonId = ?`, [id], (err, coach) => {
                if (coach) {
                    if (coach.HeadMaster == 1) {
                        console.log("User role:", "head master");  // Terminale yazdır
                        return res.json({ role: "head master" });
                    } else {
                        console.log("User role:", "coach");  // Terminale yazdır
                        return res.json({ role: "coach" });
                    }
                }

                console.log("User role:", "no valid role");  // Terminale yazdır
                return res.status(403).json({ error: "User has no valid role!" });
            });
        });
    });
});




//GETTING PERSONAL DATA OF AN ATHLETE
app.get("/athlete/personal-data/:personID", (req, res) => {
    const { personID } = req.params;

    const query = `
        SELECT Person.Id AS PersonID, Name, Surname, BirthDate, Password, Athlete.Id AS AthleteID
        FROM Person
        LEFT JOIN Athlete ON Person.Id = Athlete.PersonId
        WHERE Person.Id = ?`;

    db.get(query, [personID], (err, row) => {
        if (err) {
            res.status(500).json({ error: "Database error" });
        } else if (!row) {
            res.status(404).json({ error: "Person not found" });
        } else {
            res.json(row);
        }
    });
});

//BURASI Training groupların bilgisini sergileme yeri
// Fetch Training Group information for an athlete
app.get('/athlete/groups/:personID', (req, res) => {
    const { personID } = req.params;
    console.log("Received request for personID:", personID);

    db.get(
        `SELECT tg.Id AS GroupID, tg.Time AS Time, tg.WeekDays AS WeekDays,
                tg.ExperienceLevel, tg.MonthlyFee,
                sh.Location AS SportHallLocation,
                c.PersonId AS CoachPersonID,
                s.Name AS sportName
         FROM Athlete a
         JOIN Person pa ON a.PersonId = pa.Id
         JOIN TrainingGroup tg ON a.GroupId = tg.Id
         JOIN SportHall sh ON tg.SportHallId = sh.Id
         JOIN Coach c ON c.Id = tg.CoachId
         JOIN Sport s ON tg.SportId = s.Id
         WHERE a.PersonId = ?`,
        [personID],
        (err, row) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            console.log("Query result:", row);

            if (!row) {
                console.log("No training group found for this athlete.");
                return res.status(404).json({ error: 'No training group found for this athlete.' });
            }

            // Fetch the coach's name
            db.get(
                `SELECT Name FROM Person WHERE ID = ?`,
                [row.CoachPersonID],
                (err, coachRow) => {
                    if (err) {
                        console.error('Database error:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    if (coachRow) {
                        row.CoachName = coachRow.Name;
                        console.log("Final response:", row);
                        return res.json(row);
                    } else {
                        console.log("Coach information not found.");
                        return res.status(404).json({ error: 'Coach information not found.' });
                    }
                }
            );
        }
    );
});

//CHANGING PASSWORD
app.post("/change-password", async (req, res) => {
    const { personID, newPassword } = req.body;

    if (!personID || !newPassword) {
        return res.status(400).json({ error: "Missing person ID or new password." });
    }

    try {


        db.run("UPDATE Person SET Password = ? WHERE Id = ?", [newPassword, personID], function (err) {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error." });
            }
            res.json({ message: "Password updated successfully!" });
        });

    } catch (error) {
        console.error("Hashing error:", error);
        res.status(500).json({ error: "Error processing password change." });
    }
});





//GETTING TOURNAMENT  HISTORY OF AN ATHLETE
app.get("/athlete/tournaments/:personID", (req, res) => {
    const { personID } = req.params;

    const query = `
        SELECT Tournament.Id AS TournamentID,
               Tournament.Name AS TournamentName,
               Tournament.Date AS TournamentDate,
               ta.Rank AS Rank
        FROM Person
                 LEFT JOIN Athlete ON Person.Id = Athlete.PersonId
                 LEFT JOIN Tournament_Athlete ta ON ta.AthleteId = Athlete.Id
                 LEFT JOIN Tournament ON ta.TournamentId = Tournament.Id
        WHERE Person.Id = ?`;

    db.all(query, [personID], (err, rows) => {
        if (err) {
            res.status(500).json({ error: "Database error" });
        } else if (rows.length === 0) {
            res.status(404).json({ error: "No tournaments found for this athlete" });
        } else {
            res.json(rows);
        }
    });
});









































//ALL TRAINING GROUPS
app.get('/training-groups', (req, res) => {
    const query = `
        SELECT
            tg.ID AS id,
            tg.WeekDays AS days,
            tg.Time AS time,
            tg.ExperienceLevel AS level,
            tg.MonthlyFee AS fee,
            sh.Location AS sportHallLocation,
            p.Name || ' ' || p.Surname AS coachName
        FROM TrainingGroup tg
            JOIN SportHall sh ON tg.SportHall = sh.ID
            JOIN Coach c ON tg.Coach = c.ID
            JOIN Person p ON c.Person=p.ID
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send("Error fetching training groups.");
        }
        res.json(rows);
    });
});




//BURASI DA COACHLARIN BİLGİSİNİ SERGİLEME YERİ
// Fetch all coaches' information
app.get('/coaches', (req, res) => {
    db.all(
        `SELECT Person.Name, Person.Surname, Coach.HeadMaster, Person.BirthDate,
                Coach.Experience, Coach.Successes
         FROM Coach
                  INNER JOIN Person ON Coach.Person = Person.ID`,
        [],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            res.json(rows); // Return all coaches' details
        }
    );
});


//BURASI DA GROUPMATELERI SERGILEMEK ICIN
// Fetch athletes in the same training group
app.get('/athlete/groupmates/:personID', (req, res) => {
    const { personID } = req.params;

    db.get(
        `SELECT TrainingGroup.Id AS GroupID
         FROM Athlete
                  INNER JOIN TrainingGroup ON Athlete.GroupId = TrainingGroup.Id
         WHERE Athlete.PersonId = ?`,
        [personID],
        (err, groupRow) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (groupRow) {
                const groupID = groupRow.GroupID;

                // Fetch all athletes in the same group
                db.all(
                    `SELECT Person.Name AS Name, Person.Surname AS Surname
                     FROM Athlete
                              INNER JOIN Person ON Athlete.PersonId = Person.Id
                     WHERE Athlete.GroupId = ? AND Athlete.PersonId != ?`,
                    [groupID, personID],
                    (err, rows) => {
                        if (err) {
                            console.error('Database error:', err);
                            return res.status(500).json({ error: 'Internal server error' });
                        }

                        res.json(rows); // Return the list of athletes
                    }
                );
            } else {
                res.status(404).json({ error: 'Training group not found for this athlete.' });
            }
        }
    );
});


//ATHLETE DATABASE-DEN SILME YERI
// Endpoint to delete athlete's data and return to start page
app.delete('/athlete/terminate/:personID', (req, res) => {
    const { personID } = req.params;

    // First, delete from the Athlete table
    db.run(
        `DELETE FROM Athlete WHERE Person = ?`,
        [personID],
        (err) => {
            if (err) {
                console.error('Error deleting athlete data:', err);
                return res.status(500).json({ error: 'Error deleting athlete data' });
            }

            // Then, delete from the Person table
            db.run(
                `DELETE FROM Person WHERE ID = ?`,
                [personID],
                (err) => {
                    if (err) {
                        console.error('Error deleting person data:', err);
                        return res.status(500).json({ error: 'Error deleting person data' });
                    }

                    // Successfully deleted, return a success message
                    res.json({ message: 'Subscription terminated and data deleted' });
                }
            );
        }
    );
});







//GUEST PAGE ICIN KOD
// Endpoint to fetch guest-specific data
// Endpoint to fetch all training groups
app.get('/get-groups', (req, res) => {
    db.all(
        `SELECT tg.Id AS id, tg.WeekDays AS days, tg.Time AS time, tg.ExperienceLevel AS level,
                tg.MonthlyFee AS fee, sh.Location AS sportHallLocation,
                p.Name || ' ' || p.Surname AS coachName,
                s.Name AS sport
         FROM TrainingGroup tg
              JOIN Sport s ON tg.SportId=s.Id
              JOIN Coach c ON tg.CoachId=c.Id
              JOIN SportHall sh ON tg.SportHallId=sh.Id
              JOIN Person p ON c.PersonId=p.Id
              `,
        [],
        (err, rows) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send("Error fetching training groups.");
            }
            res.json(rows);
        }
    );
});


// Endpoint to fetch all training groups
app.get('/guest-coaches', (req, res) => {
    db.all(
        `SELECT p.Name AS name, p.Surname AS surname, c.Experience AS time, c.Successes AS success
         FROM Coach c
             JOIN Person p ON c.Person = p.ID`,
        [],
        (err, rows) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send("Error fetching coaches.");
            }
            res.json(rows);
        }
    );
});

// Endpoint to fetch all training groups
app.get('/guest-sporthalls', (req, res) => {
    db.all(
        `SELECT s.ID AS id, s.Location AS loc
         FROM SportHall s`,
        [],
        (err, rows) => {
            if (err) {
                console.error(err.message);
                return res.status(500).send("Error fetching sporthalls.");
            }
            res.json(rows);
        }
    );
});




//Adding new person
// Route to handle registration
app.post('/register', (req, res) => {
    const { id, name, surname, birthdate, password, role } = req.body;

    // Input validation (additional checks can be added)
    if (!id || !name || !surname || !birthdate || !password || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert the person into the Person table
    db.run(`INSERT INTO Person (ID, Name, Surname, BirthDate, Password) VALUES (?, ?, ?, ?, ?)`, [id, name, surname, birthdate, password], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Failed to register person' });
        }

        const personId = this.lastID; // Ensure we get the correct lastID
        console.log('Person registered with ID:', personId);

        // Check the role (Athlete or Coach) and create the respective record
        if (role === 'athlete') {
            // Find the biggest Athlete ID and add 1
            db.get('SELECT MAX(ID) AS maxId FROM Athlete', (err, row) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: 'Failed to get max Athlete ID' });
                }

                const athleteId = row.maxId ? row.maxId + 1 : 1;
                db.run(`INSERT INTO Athlete (ID, Person, TrainingGroup) VALUES (?, ?, 1)`, [athleteId, personId], (err) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ error: 'Failed to register athlete' });
                    }
                    return res.status(200).json({ message: 'Registration successful' });
                });
            });
        } else if (role === 'coach') {
            // Find the biggest Coach ID and add 1
            db.get('SELECT MAX(ID) AS maxId FROM Coach', (err, row) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ error: 'Failed to get max Coach ID' });
                }

                const coachId = row.maxId ? row.maxId + 1 : 1;
                db.run(`INSERT INTO Coach (ID, Person, Salary, Experience, Successes, HeadMaster) VALUES (?, ?, NULL, NULL, NULL, 0)`, [coachId, personId], (err) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ error: 'Failed to register coach' });
                    }
                    return res.status(200).json({ message: 'Registration successful' });
                });
            });
        } else {
            return res.status(400).json({ error: 'Invalid role' });
        }
    });
});



//FOR COACH SIGN IN
// Endpoint to fetch groups and athletes for a coach
app.get('/coach/groups/:coachID', (req, res) => {
    const coachID = req.params.coachID;

    const groupsQuery = `
        SELECT tg.ID AS GroupID, tg.Time, tg.WeekDays, tg.ExperienceLevel, tg.MonthlyFee, sh.Location AS SportHallLocation
        FROM TrainingGroup tg
                 JOIN SportHall sh ON tg.SportHall = sh.ID
        WHERE tg.Coach = ?
    `;

    const athletesQuery = `
        SELECT p.Name, p.Surname, a.ID, a.TrainingGroup
        FROM Athlete a
                 JOIN Person p ON a.Person = p.ID
        WHERE a.TrainingGroup = ?
    `;

    // Fetch groups led by the coach
    db.all(groupsQuery, [coachID], (err, groups) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching training groups.' });
        }

        // Fetch athletes for each group
        const groupData = [];
        const fetchAthletesForGroup = (group, callback) => {
            db.all(athletesQuery, [group.GroupID], (err, athletes) => {
                if (err) {
                    callback(err);
                } else {
                    groupData.push({ ...group, Athletes: athletes });
                    callback(null);
                }
            });
        };

        let pendingGroups = groups.length;
        if (pendingGroups === 0) {
            return res.json(groupData); // No groups
        }

        groups.forEach((group) => {
            fetchAthletesForGroup(group, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error fetching athletes for group.' });
                }

                pendingGroups--;
                if (pendingGroups === 0) {
                    res.json(groupData);
                }
            });
        });
    });
});

// Removing an athlete from a group
// Endpoint to remove an athlete from their training group
app.put('/athlete/remove/:athleteID', (req, res) => {
    const athleteID = req.params.athleteID;

    console.log(`Attempting to remove athlete with ID: ${athleteID}`); // Add this line

    const query = `
        UPDATE Athlete
        SET TrainingGroup = NULL
        WHERE ID = ?
    `;

    db.run(query, [athleteID], function (err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Error removing athlete from group.' });
        }

        if (this.changes > 0) {
            res.json({ message: 'Athlete successfully removed from group.' });
        } else {
            res.status(404).json({ error: 'Athlete not found.' });
        }
    });
});

