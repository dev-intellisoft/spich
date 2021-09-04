-- auto-generated definition
CREATE TABLE access_tokens
(
    access_token VARCHAR (255) NOT NULL,
    app_name     VARCHAR (50) NOT NULL,
    user_id      INTEGER NOT NULL REFERENCES users,
    expires      TIMESTAMP WITH TIME ZONE NOT NULL,
    app_id       INTEGER NOT NULL
            REFERENCES applications
);

