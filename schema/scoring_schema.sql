CREATE DATABASE scoringProject;

USE scoringProject;

CREATE TABLE data (
  ID int NOT NULL AUTO_INCREMENT,
  Name VARCHAR(255),
  Score int,
  Date DATETIME,
  PRIMARY KEY (ID)
);
