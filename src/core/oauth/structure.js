import Database from '../database'
class structure
{
    create_application_sequence = async () => new Database().query(`
        CREATE SEQUENCE IF NOT EXISTS ${process.env.db_schema || `public`}.app_id_seq
        INCREMENT 1
        MAXVALUE 9223372036854775807
        CACHE 1
    `)

    create_application_table = async () => new Database().query(`
        CREATE TABLE IF NOT EXISTS ${process.env.db_schema || `public`}.applications
        (
            app_id integer NOT NULL DEFAULT nextval('app_id_seq'::regclass),
            app_name text COLLATE pg_catalog."default" NOT NULL,
            app_secret text COLLATE pg_catalog."default" NOT NULL,
            redirect_uri text COLLATE pg_catalog."default",
            description text COLLATE pg_catalog."default",
            CONSTRAINT applications_pkey PRIMARY KEY (app_id),
            CONSTRAINT applications_app_name_key UNIQUE (app_name)
        )
    `)

    grant_applicaition_table_permission = async () => new Database().query(`
        ALTER TABLE ${process.env.db_schema || `public`}.applications OWNER to ${process.env.db_user}
    `)

    grant_application_sequence_permission = async () => new Database().query(`
        ALTER SEQUENCE nfe.app_id_seq OWNER TO ${process.env.db_user}
    `)

    create_user_sequence = async () => await  new Database().query(`
        CREATE SEQUENCE IF NOT EXISTS ${process.env.db_schema || `public`}.user_id_seq
        INCREMENT 1
        MAXVALUE 9223372036854775807
        CACHE 1
    `)

    create_user_table = async () => await new Database().query(`
        CREATE TABLE IF NOT EXISTS ${process.env.db_schema || `public`}.users
        (
            user_id integer NOT NULL DEFAULT nextval('user_id_seq'::regclass),
            username text COLLATE pg_catalog."default" NOT NULL,
            email text COLLATE pg_catalog."default",
            password text COLLATE pg_catalog."default",
            CONSTRAINT users_pkey PRIMARY KEY (user_id)
        )
    `)

    grant_user_table_permission = async () => new Database().query(`
        ALTER TABLE ${process.env.db_schema || `public`}.users OWNER to ${process.env.db_user}
    `)

    grant_user_sequence_permission = async () => new Database().query(`
        ALTER SEQUENCE IF EXISTS ${process.env.db_schema || `public`}.user_id_seq OWNER TO ${process.env.db_user}
    `)

    create_access_token_table = async () => new Database().query(`
        CREATE TABLE IF NOT EXISTS ${process.env.db_schema || `public`}.access_tokens
        (
            access_token text COLLATE pg_catalog."default" NOT NULL,
            app text COLLATE pg_catalog."default" NOT NULL,
            user_id integer NOT NULL,
            expires timestamp with time zone NOT NULL,
            app_id integer NOT NULL,
            CONSTRAINT app_id_fk FOREIGN KEY (app_id)
                REFERENCES ${process.env.db_schema || `public`}.applications (app_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION,
            CONSTRAINT user_id_fk FOREIGN KEY (user_id)
                REFERENCES ${process.env.db_schema || `public`}.users (user_id) MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION
        )
    `)

    grant_access_token_table_permission = async () => new Database().query(`
        ALTER TABLE ${process.env.db_schema || `public`}.access_tokens OWNER to ${process.env.db_user};
    `)

    create_refresh_token_table = async () => new Database().query(`
        CREATE TABLE IF NOT EXISTS ${process.env.db_schema || `public`}.refresh_tokens
        (
            app_id integer NOT NULL,
            user_id integer NOT NULL,
            app text COLLATE pg_catalog."default" NOT NULL,
            refresh_token text COLLATE pg_catalog."default" NOT NULL,
            expires timestamp without time zone NOT NULL
        )
    `)

    grant_refresh_token_permission = async () => new Database().query(`
        ALTER TABLE ${process.env.db_schema || `public`}.refresh_tokens OWNER to ${process.env.db_user};
    `)
}

export default structure