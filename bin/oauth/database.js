import fs from 'fs'
import Pool from 'pg-pool'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import mysql from 'mysql2'

class Database
{
    #db_name
    #db_driver
    #db_user
    #db_host
    #db_password
    #db_database
    #db_port
    #db_filename //if sqlite

    constructor(props = {})
    {
        if ( props.driver === `sqlite` )
        {
            this.#db_name = props.name
            this.#db_filename = props.file
            this.#db_driver = props.driver
        }

        if ( props.driver === `postgres` )
        {
            this.#db_name = props.name
            this.#db_driver = props.driver
            this.#db_host = props.host
            this.#db_user = props.user
            this.#db_password = props.password
            this.#db_database = props.database
            this.#db_port = props.port
        }

        if ( props.driver === `mysql` )
        {
            this.#db_name = props.name
            this.#db_driver = props.driver
            this.#db_host = props.host
            this.#db_user = props.user
            this.#db_password = props.password
            this.#db_database = props.database
            this.#db_port = props.port
        }
    }

    query = async (sql) =>
    {
        if ( this.#db_driver === `postgres` )
        {
            const user = this.#db_user
            const password = this.#db_password
            const host = this.#db_host
            const database = this.#db_database

            return new Promise(function (resolve, reject)
            {
                const config = { user, password, host, database, max:10, idleTimeoutMillis: 1000 }

                const pool = new Pool(config)

                pool.on(`error`, (e, client) =>
                {
                    console.log(e)
                    console.log(client)
                })

                pool.query(sql, (err, result) =>
                {
                    if (err)
                        return resolve(err)

                     if ( typeof result === undefined ) resolve([])
                    resolve(result.rows)
                })
            })
        }
        else if ( this.#db_driver === `sqlite` )
        {
            const db = open({
                filename:`${APP_PATH}/${this.#db_filename}`,
                driver:sqlite3.Database
            })

            return (await db).all(sql)
        }
        else if ( this.#db_driver === `mysql` )
        {
            return new Promise( (resolve, reject) =>
            {
                let res
                const connection = mysql.createConnection({
                    host: this.#db_host,
                    user: this.#db_user,
                    password: this.#db_password,
                    database: this.#db_database
                })
                connection.connect()

                connection.query(sql, async (error, results, fields) =>
                {
                    if (error) throw error
                    return resolve(results) && connection.end()
                })
            })
        }
    }

    create_refresh_tokens_table = async () =>
    {
        try
        {
            let fragment = `NOT NULL`
            if ( this.#db_driver === `mysql` )
                fragment = ``
            const sql = `
                CREATE TABLE IF NOT EXISTS refresh_tokens
                (
                    app_id INTEGER NOT NULL,
                    user_id INTEGER  NULL,
                    app_name VARCHAR (50) NOT NULL,
                    refresh_token VARCHAR(255) NOT NULL,
                    expires TIMESTAMP ${fragment}
                )
            `
            return await this.query(sql)
        }
        catch (e)
        {
            return  e
        }
    }

    create_access_tokens_table = async () =>
    {
        try
        {
            let fragment = `WITH TIME ZONE NOT NULL`
            if ( this.#db_driver === `mysql` )
                fragment = ``
            const sql = `
                CREATE TABLE IF NOT EXISTS access_tokens
                (
                    access_token VARCHAR (255) NOT NULL,
                    app_name     VARCHAR (50) NOT NULL,
                    user_id      INTEGER NOT NULL REFERENCES users,
                    expires      TIMESTAMP ${fragment},
                    app_id       INTEGER NOT NULL
                            REFERENCES applications
                )
            `
            return await this.query(sql)
        }
        catch (e)
        {
            console.log(e)
        }
    }

    create_application_table = async () =>
    {
        try
        {
            let fragment = ``
            if ( this.#db_driver === `mysql` )
                fragment = `AUTO_INCREMENT`
            const sql = `
                CREATE TABLE IF NOT EXISTS applications
                (
                    app_id       INTEGER NOT NULL ${fragment} PRIMARY KEY,
                    app_name     VARCHAR (50) NOT NULL UNIQUE ,
                    app_secret   VARCHAR (255) NOT NULL,
                    redirect_uri VARCHAR (255),
                    description  VARCHAR (255)
                )
            `

            if ( this.#db_driver === `postgres` )
            {
                await this.query(`
                    CREATE SEQUENCE IF NOT EXISTS app_id_seq
                `)

                await this.query(`
                    ALTER TABLE applications
                    ALTER COLUMN app_id SET DEFAULT nextval('app_id_seq')
                `)
            }

            return await this.query(sql)
        }
        catch (e)
        {
            return e
        }
    }

    create_user_table = async () =>
    {
        try
        {
            let fragment = ``
            if ( this.#db_driver === `mysql` )
                fragment = `AUTO_INCREMENT`
            const sql = `
                CREATE TABLE IF NOT EXISTS users
                (
                    user_id INTEGER NOT NULL ${fragment} PRIMARY KEY,
                    email VARCHAR (255) NOT NULL UNIQUE,
                    username VARCHAR (255) NOT NULL UNIQUE,
                    password VARCHAR (255) NOT NULL
                )
            `

            if ( this.#db_driver === `postgres` )
            {
                await this.query(`
                    CREATE SEQUENCE IF NOT EXISTS user_id_seq
                `)

                await this.query(`
                    ALTER TABLE users
                    ALTER COLUMN user_id SET DEFAULT nextval('user_id_seq')
                `)
            }
            return await this.query(sql)
        }
        catch (e)
        {
            return e
        }
    }

    insert_application = async ( application, password ) =>
    {
        try
        {
            let fragment = ``
            if ( this.#db_driver === `mysql` )
                fragment = `IGNORE`
            let sql = `
                INSERT ${fragment} INTO applications(app_name, app_secret) VALUES('${application}', '${password}')
            `
            if ( this.#db_driver === `postgres` )
            {
                sql = `
                    INSERT INTO applications(app_name, app_secret) VALUES('${application}', '${password}')
                    ON CONFLICT (app_name) 
                    DO NOTHING
                `
            }
            return await this.query(sql)
        }
        catch (e)
        {
            return e
        }
    }

    init = async () =>
    {
        await this.create_user_table()
        await this.create_application_table()
        await this.create_access_tokens_table()
        await this.create_refresh_tokens_table()
    }
}


export default Database