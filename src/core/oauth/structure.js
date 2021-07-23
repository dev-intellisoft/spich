import Database from '../database'
import mongoose from 'mongoose'
import Logger from '../logger'

class structure
{
    create_application_sequence = async () =>
    {
        try
        {
            return await new Database().query(`
                CREATE SEQUENCE IF NOT EXISTS ${process.env.DB_SCHEMA || `public`}.app_id_seq
                INCREMENT 1
                MAXVALUE 9223372036854775807
                CACHE 1
            `)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    create_application_table = async () =>
    {
        try
        {
            return await new Database().query(`
                CREATE TABLE IF NOT EXISTS ${process.env.DB_SCHEMA || `public`}.applications
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
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    grant_applicaition_table_permission = async () =>
    {
        try
        {
            return await new Database().query(`
                ALTER TABLE ${process.env.DB_SCHEMA || `public`}.applications OWNER to ${process.env.DB_USER}
            `)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    grant_application_sequence_permission = async () =>
    {
        try
        {
            return await new Database().query(`
                ALTER SEQUENCE app_id_seq OWNER TO ${process.env.DB_USER}
            `)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    create_user_sequence = async () =>
    {
        try
        {
            return await  new Database().query(`
                CREATE SEQUENCE IF NOT EXISTS ${process.env.DB_SCHEMA || `public`}.user_id_seq
                INCREMENT 1
                MAXVALUE 9223372036854775807
                CACHE 1
            `)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    create_user_table = async () =>
    {
        try
        {
            return await new Database().query(`
                CREATE TABLE IF NOT EXISTS ${process.env.DB_SCHEMA || `public`}.users
                (
                    user_id integer NOT NULL DEFAULT nextval('user_id_seq'::regclass),
                    username text COLLATE pg_catalog."default" NOT NULL,
                    email text COLLATE pg_catalog."default",
                    password text COLLATE pg_catalog."default",
                    CONSTRAINT users_pkey PRIMARY KEY (user_id)
                )
            `)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    grant_user_table_permission = async () =>
    {
        try
        {
            return await new Database().query(`
                ALTER TABLE ${process.env.DB_SCHEMA || `public`}.users OWNER to ${process.env.DB_USER}
            `)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    grant_user_sequence_permission = async () =>
    {
        try
        {
            return await new Database().query(`
                ALTER SEQUENCE IF EXISTS ${process.env.DB_SCHEMA || `public`}.user_id_seq OWNER TO ${process.env.DB_USER}
            `)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    create_access_token_table = async () =>
    {
        try
        {
            return await new Database().query(`
                CREATE TABLE IF NOT EXISTS ${process.env.DB_SCHEMA || `public`}.access_tokens
                (
                    access_token text COLLATE pg_catalog."default" NOT NULL,
                    app_name text COLLATE pg_catalog."default" NOT NULL,
                    user_id integer NOT NULL,
                    expires timestamp with time zone NOT NULL,
                    app_id integer NOT NULL,
                    CONSTRAINT app_id_fk FOREIGN KEY (app_id)
                        REFERENCES ${process.env.DB_SCHEMA || `public`}.applications (app_id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION,
                    CONSTRAINT user_id_fk FOREIGN KEY (user_id)
                        REFERENCES ${process.env.DB_SCHEMA || `public`}.users (user_id) MATCH SIMPLE
                        ON UPDATE NO ACTION
                        ON DELETE NO ACTION
                )
            `)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    grant_access_token_table_permission = async () =>
    {
        try
        {
            return await new Database().query(`
                ALTER TABLE ${process.env.DB_SCHEMA || `public`}.access_tokens OWNER to ${process.env.DB_USER};
            `)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    create_refresh_token_table = async () =>
    {
        try
        {
            return await new Database().query(`
                CREATE TABLE IF NOT EXISTS ${process.env.DB_SCHEMA || `public`}.refresh_tokens
                (
                    app_id integer NOT NULL,
                    user_id integer NOT NULL,
                    app text COLLATE pg_catalog."default" NOT NULL,
                    refresh_token text COLLATE pg_catalog."default" NOT NULL,
                    expires timestamp without time zone NOT NULL
                )
            `)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    grant_refresh_token_permission = async () =>
    {
        try
        {
            return await new Database().query(`
                ALTER TABLE ${process.env.DB_SCHEMA || `public`}.refresh_tokens OWNER to ${process.env.DB_USER};
            `)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    create_test_user = async () =>
    {
        try
        {
            return await new Database().query(`
                INSERT INTO ${process.env.DB_SCHEMA || `public`}.users
                    ( username, email, password )
                SELECT 'test', 'test@test.com', MD5('test')
                WHERE
                    NOT EXISTS (
                        SELECT user_id FROM ${process.env.DB_SCHEMA || `public`}.users 
                        WHERE username = 'test' AND email = 'test@test.com'
                    );
            `)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    create_test_application = async () =>
    {
        try
        {
            return await  new Database().query(`
                INSERT INTO 
                    ${process.env.DB_SCHEMA || `public`}.applications( app_name, app_secret, description ) 
                SELECT 'test', MD5('test'), 'test' WHERE NOT EXISTS 
                (
                    SELECT app_id from ${process.env.DB_SCHEMA || `public`}.applications 
                    WHERE app_name = 'test'
                )
            `)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    init = async () =>
    {
        try
        {
            if ( process.env.DB_TYPE === `mongo` )
            {
                mongoose.connect(process.env.MONGO_URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                })

                mongoose.connection.on(`open`, async () =>
                {
                    let result = []
                    const collections = await mongoose.connection.db.listCollections().toArray()

                    collections.map(coll => result.push(coll.name))

                    if ( result.indexOf(`applications`) === -1 )
                    {
                        const applications = mongoose.model( `applications`, new mongoose.Schema(
                            {
                                "app_name":"String",
                                "app_secret":"String" ,
                                "redirect_url":"String",
                                "description":"String"
                            }))



                        new applications(
                            {
                                "app_name":"test",
                                "app_secret":"test",
                                "redirect_url":"test",
                                "description":"test"
                            }).save()
                    }

                    if ( result.indexOf(`users`) === -1 )
                    {
                        const users = mongoose.model( `users`, new mongoose.Schema({
                            "username":"String",
                            "email":"String",
                            "password":"String"
                        }))

                        new users(
                            {
                                "username":"test",
                                "email":"test@test.com",
                                "password":"test"
                            }).save()
                    }

                    if ( result.indexOf(`access_tokens`) === -1 )
                        await mongoose.connection.db.createCollection(`access_tokens`)

                    if ( result.indexOf(`refresh_tokens`) === -1 )
                        await mongoose.connection.db.createCollection(`refresh_tokens`)
                })
            }
            else if ( process.env.DB_TYPE === `postgres` )
            {
                await this.create_application_sequence()
                await this.create_application_table()
                await this.grant_application_sequence_permission()
                await this.grant_applicaition_table_permission()

                await this.create_user_sequence()
                await this.create_user_table()
                await this.grant_user_sequence_permission()
                await this.grant_user_table_permission()

                await this.create_access_token_table()
                await this.grant_access_token_table_permission()

                await this.create_refresh_token_table()
                await this.grant_refresh_token_permission()

                await this.create_test_application()
                // await this.create_test_user()
            }
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }
}

export default structure