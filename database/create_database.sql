USE `heroku_d015497bbaaf387`;

CREATE TABLE tblS (
    SID INT NOT NULL AUTO_INCREMENT,
    SValue VARCHAR(200) NOT NULL,
    PRIMARY KEY (SID)
);

CREATE TABLE tblP (
    PID INT NOT NULL AUTO_INCREMENT,
    PValue VARCHAR(200) NOT NULL,
    PRIMARY KEY (PID)
);

CREATE TABLE tblUSER (
    UserID INT NOT NULL AUTO_INCREMENT,
    PID INT NOT NULL,
    SID INT NOT NULL,
    UserFName VARCHAR(60) NOT NULL,
    UserLName VARCHAR(60) NOT NULL,
    UserEmail VARCHAR(60) NOT NULL,
    UserBirthDate DATE NOT NULL,
    UserGender VARCHAR(5) NOT NULL,
    FullAccount BIT(1) NOT NULL,
    PRIMARY KEY (UserID),
    FOREIGN KEY (PID)
        REFERENCES tblP (PID),
    FOREIGN KEY (SID)
        REFERENCES tblS (SID)
);

CREATE TABLE tblEVENT (
    EventID INT NOT NULL AUTO_INCREMENT,
    EventName VARCHAR(80) NOT NULL,
    EventDesc VARCHAR(500) NULL,
    EventCreatorID INT NOT NULL,
    EventStartDate DATE NOT NULL,
    EventEndDate DATE NOT NULL,
    EventLength INT NOT NULL,
    EventStartTime TIME NOT NULL,
    EventEndTime TIME NOT NULL,
    NotifyNumParticipant INT NOT NULL,
    NotifyDays INT NOT NULL,
    NotifyEachParticipant BIT(1) NOT NULL,
    EventUUID VARCHAR(100) NOT NULL,
    PRIMARY KEY (EventID),
    FOREIGN KEY (EventCreatorID)
        REFERENCES tblUSER (UserID)
);

CREATE TABLE tblPREFERENCES (
    PreferenceID INT NOT NULL AUTO_INCREMENT,
    PreferenceName VARCHAR(80) NOT NULL,
    PreferenceDesc VARCHAR(500) NULL,
    PRIMARY KEY (PreferenceID)
);

CREATE TABLE tblTIME (
    TimeID INT NOT NULL AUTO_INCREMENT,
    UserID INT NOT NULL,
    EventID INT NOT NULL,
    StartTime TIME NOT NULL,
    PreferenceID INT,
    PRIMARY KEY (TimeID),
    FOREIGN KEY (UserID)
        REFERENCES tblUSER (UserID),
    FOREIGN KEY (EventID)
        REFERENCES tblEVENT (EventID)
);