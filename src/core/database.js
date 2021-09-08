/**
 * Created by wellington on 07/04/17.
 *
 *
 * May 10, 2017
 * Changed the database to return the PG object
 *
 */

import fs from 'fs'
import Logger from './logger'
import Pool from 'pg-pool'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import mysql from 'mysql2'

class  Database
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

    query = async ( sql ) =>
    {
        try
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
                        {
                            console.log(err)
                            new Logger().log_query(sql)

                            new Logger().error(`You have some error while try to run "${sql}" in your database!`)

                            if ( err.code === `28000` )
                                resolve({ code:err.code, message:`INVALID AUTHORIZATION SPECIFICATION` })

                            resolve(err)
                        }
                        else
                        {
                            if ( typeof result === undefined ) resolve([])

                            new Logger().log_query(sql)
                            resolve(result.rows)
                        }
                    })
                })
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

                    connection.query(sql, (error, results, fields) =>
                    {
                        if (error) reject(error)
                        resolve(results) && connection.end()
                    })

                })
            }
            else if ( this.#db_driver === `sqlite` )
            {
                try
                {
                    const db = open({
                        filename:`${APP_PATH}/${this.#db_filename}`,
                        driver:sqlite3.Database
                    })
                    if (sql.trim().toLowerCase().startsWith(`select`))
                        return (await db).all(sql)
                    if (sql.trim().toLowerCase().startsWith(`create`))
                        return (await db).run(sql)
                    if (sql.trim().toLowerCase().startsWith(`insert`))
                        return (await db).run(sql)
                    if (sql.trim().toLowerCase().startsWith(`update`))
                        return (await db).run(sql)
                    if (sql.trim().toLowerCase().startsWith(`delete`))
                        return (await db).run(sql)
                    if (sql.trim().toLowerCase().startsWith(`drop`))
                        return (await db).run(sql)
                }
                catch (e)
                {
                    return  e
                }
            }
            else
            {
                return { code: `ERR`, message:`Database configuration error!` }
            }
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }
}

export default Database
