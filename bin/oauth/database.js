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
        if ( this.#db_driver === `sqlite` )
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
                    if (error) {
                        console.log(sql)
                        throw error
                    }
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
            console.log(e)
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
            if ( this.#db_name === `mysql` )
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
            return await this.query(sql)
        }
        catch (e)
        {
            console.log(e)
        }
    }

    create_user_table = async () =>
    {
        try
        {
            const sql = `
                CREATE TABLE IF NOT EXISTS users
                (
                    user_id INTEGER NOT NULL PRIMARY KEY,
                    email VARCHAR (255) NOT NULL UNIQUE,
                    username VARCHAR (255) NOT NULL UNIQUE,
                    password VARCHAR (255) NOT NULL
                )
            `
            await this.query(sql)
        }
        catch (e)
        {
            console.log(e)
        }
    }

    insert_application = async ( application, password ) =>
    {
        try
        {
            const sql = `
                INSERT IGNORE INTO applications(app_name, app_secret) VALUES('${application}', '${password}')
            `
            return await this.query(sql)
        }
        catch (e)
        {
            console.log(e)
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