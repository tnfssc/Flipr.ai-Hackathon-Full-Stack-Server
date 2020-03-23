CREATE TABLE Users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    passwd VARCHAR(255) NOT NULL,
    new_passwd VARCHAR(255),
    verified NUMERIC(1) NOT NULL,
    emailVerifyId VARCHAR(255) NOT NULL,
    loginToken VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE TeamsAndUsers (
	teamsAndUsersId INT NOT NULL AUTO_INCREMENT,
    teamId INT,
    userId INT,
    FOREIGN KEY (teamId) REFERENCES Teams(teamId),
    FOREIGN KEY (userId) REFERENCES Users(id),
    PRIMARY KEY (teamsAndUsersId),
    UNIQUE KEY(teamId, userId)
);

CREATE TABLE Teams (
    teamId INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    PRIMARY KEY (teamId)
);

CREATE TABLE PersonalBoards (
    personalBoardId INT NOT NULL AUTO_INCREMENT,
    boardId INT,
    userId INT,
    FOREIGN KEY (boardId) REFERENCES Boards(boardId),
    FOREIGN KEY (userId) REFERENCES Users(id),
    PRIMARY KEY (personalBoardId),
    UNIQUE KEY(boardId, userId)
);

CREATE TABLE TeamBoards (
    teamBoardId INT NOT NULL AUTO_INCREMENT,
    boardId INT,
    teamId INT,
    FOREIGN KEY (boardId) REFERENCES Boards(boardId),
    FOREIGN KEY (teamId) REFERENCES Teams(teamId),
    PRIMARY KEY (teamBoardId),
    UNIQUE KEY(boardId, teamId)
);

CREATE TABLE Boards (
    boardId INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    PRIMARY KEY (boardId)
);

CREATE TABLE Lists (
    listId INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    boardId INT,
    FOREIGN KEY (boardId) REFERENCES Boards(boardId),
    PRIMARY KEY (listId)
);

CREATE TABLE Cards (
    cardId INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    dueDate VARCHAR(255) NOT NULL,
    listId INT,
    FOREIGN KEY (listId) REFERENCES Lists(listId),
    PRIMARY KEY (cardId)
);

INSERT INTO Users (username, passwd) VALUES ('tnfssc', 'abcd');

DELETE FROM Users WHERE username='tnfssc';

SELECT * FROM Users WHERE username='tnfssc';

SELECT id, username, passwd FROM Users;

SET SQL_SAFE_UPDATES = 0;
SET SQL_SAFE_UPDATES = 1;

CREATE DATABASE RoiPsAjBmd;
DROP TABLE Teams;
DROP DATABASE RoiPsAjBmd;