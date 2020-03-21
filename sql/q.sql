CREATE TABLE Users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    passwd VARCHAR(255) NOT NULL,
    new_passwd VARCHAR(255),
    verified NUMERIC(1) NOT NULL,
    emailVerifyId VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);


INSERT INTO Users (username, passwd) VALUES ('tnfssc', 'abcd');

DELETE FROM Users WHERE username='tnfssc';

SELECT * FROM Users WHERE username='tnfssc';

SELECT id, username, passwd FROM Users;

SET SQL_SAFE_UPDATES = 0;
SET SQL_SAFE_UPDATES = 1;

DROP TABLE Users;