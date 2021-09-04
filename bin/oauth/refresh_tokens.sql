-- auto-generated definition
CREATE TABLE refresh_tokens
(
    app_id INTEGER NOT NULL,
    user_id INTEGER  NULL,
    app_name VARCHAR (50) NOT NULL,
    refresh_token VARCHAR NOT NULL,
    expires TIMESTAMP NOT NULL
);
