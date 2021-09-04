-- auto-generated definition
CREATE TABLE applications
(
    app_id       INTEGER NOT NULL PRIMARY KEY,
    app_name     VARCHAR (50) not null unique,
    app_secret   VARCHAR (255) NOT NULL,
    redirect_uri VARCHAR (255),
    description  VARCHAR (255)
);

