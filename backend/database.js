const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./backend/database.db');

// Tabloların oluşturulması
db.serialize(() => {


    db.run(`PRAGMA foreign_keys = ON;`); // Foreign key desteğini aç

    db.run(`CREATE TABLE IF NOT EXISTS Person (
                                                  Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  Name TEXT NOT NULL,
                                                  Surname TEXT NOT NULL,
                                                  BirthDate INTEGER NOT NULL,  -- Unix timestamp olarak saklanacak
                                                  Password TEXT NOT NULL
            )`);

    db.run(`CREATE TABLE IF NOT EXISTS Athlete (
                                                   Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                   PersonId INTEGER NOT NULL,
                                                   GroupId INTEGER NOT NULL,
                                                   FOREIGN KEY (PersonId) REFERENCES Person(Id) ON DELETE CASCADE,
        FOREIGN KEY (GroupId) REFERENCES TrainingGroup(Id) ON DELETE SET NULL
        )`);

    db.run(`CREATE TABLE IF NOT EXISTS Coach (
                                                 Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 PersonId INTEGER NOT NULL,
                                                 Salary INTEGER NOT NULL,
                                                 Experience TEXT NOT NULL,
                                                 Successes TEXT NOT NULL,
                                                 HeadMaster INTEGER, -- Başka bir Coach'a referans olabilir
                                                 FOREIGN KEY (PersonId) REFERENCES Person(Id) ON DELETE CASCADE
        )`);

    db.run(`CREATE TABLE IF NOT EXISTS TrainingGroup (  -- 'Group' yerine 'TrainingGroup' kullanıldı
                                                         Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         Time TEXT NOT NULL,
                                                         WeekDays TEXT NOT NULL,
                                                         ExperienceLevel TEXT NOT NULL,
                                                         SportHallId INTEGER NOT NULL,
                                                         MonthlyFee INTEGER NOT NULL,
                                                         CoachId INTEGER NOT NULL,
                                                         SportId INTEGER NOT NULL,
                                                         FOREIGN KEY (SportHallId) REFERENCES SportHall(Id),
        FOREIGN KEY (CoachId) REFERENCES Coach(Id),
        FOREIGN KEY (SportId) REFERENCES Sport(Id)
        )`);

    db.run(`CREATE TABLE IF NOT EXISTS News (
                                                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                Name TEXT NOT NULL,
                                                Description TEXT NOT NULL
            )`);

    db.run(`CREATE TABLE IF NOT EXISTS Payment (
                                                   Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                   Date INTEGER NOT NULL, -- Unix timestamp olarak saklanacak
                                                   Amount INTEGER NOT NULL, -- Kuruş hassasiyeti istenirse REAL kullanılabilir
                                                   Description TEXT NOT NULL,
                                                   UserId INTEGER NOT NULL,
                                                   FOREIGN KEY (UserId) REFERENCES Athlete(Id) ON DELETE CASCADE
        )`);

    db.run(`CREATE TABLE IF NOT EXISTS Sport (
                                                 Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 Name TEXT NOT NULL
            )`);

    db.run(`CREATE TABLE IF NOT EXISTS SportHall (
                                                     Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                     Location TEXT NOT NULL
            )`);

    db.run(`CREATE TABLE IF NOT EXISTS Sport_Coach (
                                                       CoachId INTEGER NOT NULL,
                                                       SportId INTEGER NOT NULL,
                                                       PRIMARY KEY (CoachId, SportId),
        FOREIGN KEY (CoachId) REFERENCES Coach(Id) ON DELETE CASCADE,
        FOREIGN KEY (SportId) REFERENCES Sport(Id) ON DELETE CASCADE
        )`);

    db.run(`CREATE TABLE IF NOT EXISTS Tournament (
                                                      Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                      Name TEXT NOT NULL,
                                                      Date INTEGER NOT NULL -- Unix timestamp olarak saklanacak
            )`);

    db.run(`CREATE TABLE IF NOT EXISTS Tournament_Athlete (
        AthleteId INTEGER NOT NULL,
        TournamentId INTEGER NOT NULL,
        Rank INTEGER,
        PRIMARY KEY (AthleteId, TournamentId),
        FOREIGN KEY (AthleteId) REFERENCES Athlete(Id) ON DELETE CASCADE,
        FOREIGN KEY (TournamentId) REFERENCES Tournament(Id) ON DELETE CASCADE
    )`);

    console.log("Database tables created successfully!");

    /*
    db.all("SELECT Date FROM Tournament LIMIT 5", [], (err, rows) => {
        if (err) throw err;
        console.log(rows);
    });
*/

});

module.exports = db;
