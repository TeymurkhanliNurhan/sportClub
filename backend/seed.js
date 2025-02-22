const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/database.db');

db.serialize(() => {

    // Person Table
    db.run(`INSERT INTO Person (Id, Name, Surname, BirthDate, Password) VALUES 
        (1, 'Ali', 'Yılmaz', '1995-06-15', 'pass123'),
        (2, 'Zeynep', 'Demir', '1998-02-20', 'secure456'),
        (3, 'Mert', 'Kaya', '2000-11-05', 'test789'),
        (4, 'Nurhan', 'Teymurkhanli', '2004-12-18', '1905'),
        (5, 'Fantina', 'Aliyeva', '2005-09-11', 'fantina')
    `);

    // Athlete Table
    db.run(`INSERT INTO Athlete (Id, PersonId, GroupId) VALUES 
        (1, 1, 1),
        (2, 2, 2),
        (3, 5, 1)
    `);

    // Coach Table
    db.run(`INSERT INTO Coach (Id,PersonId, Salary, Experience, Successes, HeadMaster) VALUES 
        (1, 3, 5000, '10 years', '5 championship wins', 0),
        (2,4, 10000, '12 years', '7 championship wins', 1 )
    `);

    // Group Table
    db.run(`INSERT INTO TrainingGroup (Id, Time, WeekDays, ExperienceLevel, SportHallId, MonthlyFee, CoachId, SportId) VALUES 
        (1, '18:00', 'Monday, Wednesday', 'Beginner', 1, 200, 1, 1),
        (2, '20:00', 'Tuesday, Thursday', 'Intermediate', 2, 300, 1, 2)
    `);

    // Sport Table
    db.run(`INSERT INTO Sport (Id, Name) VALUES 
        (1, 'Basketball'),
        (2, 'Football')
    `);

    // SportHall Table
    db.run(`INSERT INTO SportHall (Id, Location) VALUES 
        (1, 'Downtown Arena'),
        (2, 'City Stadium')
    `);

    // Sport_Coach Table
    db.run(`INSERT INTO Sport_Coach (CoachId, SportId) VALUES 
        (1, 1),
        (1, 2)
    `);

    // Tournament Table
    db.run(`INSERT INTO Tournament (Id, Name, Date) VALUES
         (1, 'Winter Cup', strftime('%s', '2025-01-15')),
         (2, 'Spring League', strftime('%s', '2025-04-10'))
    `);


    // Tournament_Athlete Table
    db.run(`INSERT INTO Tournament_Athlete (AthleteId, TournamentId, Rank) VALUES 
        (1, 1, 2),
        (2, 2, 1)
    `);

    // News Table
    db.run(`INSERT INTO News (Id, Name, Description) VALUES 
        (1, 'New Season', 'The new training season starts soon!'),
        (2, 'Championship', 'Our team won the national championship!')
    `);

    // Payment Table
    db.run(`INSERT INTO Payment (Id, Date, Amount, Description, UserId) VALUES 
        (1, '2025-02-01', 200, 'Monthly Fee', 1),
        (3, '2025-02-20', 250, 'Monthly Fee', 1),
        (2, '2025-02-05', 300, 'Monthly Fee', 2)
    `);

    console.log("Test verileri başarıyla eklendi!");


});


