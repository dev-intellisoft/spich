/**
 * Created by wellington on 07/04/17.
 *
 *
 * May 10, 2017
 * Changed the database to return the PG object
 *
 */

import mongoose from 'mongoose'
import fs from 'fs'
import Logger from './logger'
import Pool from 'pg-pool'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

var models = []

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

    }
    load = async ( collection ) =>
    {
        try
        {
            if ( models[`${collection}`] !== undefined )
                return models[`${collection}`]

            if ( fs.existsSync(`${APP_PATH}/models/schemas/${collection}.js`) )
            {
                const s = await import(`${APP_PATH}/models/schemas/${collection}.js`)
                const schema = new mongoose.Schema(s.schema())
                models[`${collection}`] = mongoose.model(collection, schema)
                return models[`${collection}`]
            }
            else if ( fs.existsSync(`${process.env.PWD}/node_modules/spich/src/core/models/schemas/${collection}.js`) )
            {
                const s = await import(`./models/schemas/${collection}.js`)
                const schema = new mongoose.Schema(s.schema())
                models[`${collection}`] = mongoose.model(collection, schema)
                return models[`${collection}`]
            }
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    mselect = async ( collection, where={}, one = false ) =>
    {
        try
        {
            const model = await this.load(collection)

            if (one)
                return await model.findOne(where)
            return await model.find(where)
        }
        catch (e)
        {
            new Logger().error(e)
            return e
        }
    }

    mselect_partial = async ( collection, where, part, one ) =>
    {
        try
        {
            const model = await this.load(collection)

            if ( one )
                return await model.findOne(where, part)

            return await model.find(where, part)
        }
        catch ( e )
        {
            new Logger().error(e)
            return e
        }
    }

    minsert = async ( collection, data ) =>
    {
        try
        {
            const model = await this.load(collection)
            collection = new model(data)
            return await collection.save()
        }
        catch (e)
        {
            new Logger().error(e)
            return e
        }
    }

    mupdate = async ( collection, data, where, many = false ) =>
    {
        try
        {
            const model = await this.load(collection)
            if( many )
                return await model.updateMany(where, data)
            await model.findOneAndUpdate(where, data)
            return await model.find(where)
        }
        catch (e)
        {
            new Logger().error(e)
            return e
        }
    }

    mdelete = async ( collection, where, many = false ) =>
    {
        try
        {
            const model = await this.load(collection)

            if ( many )
                return await model.deleteMany(where)

            return await model.findOneAndRemove(where)
        }
        catch (e)
        {
            new Logger().error(e)
            return e
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

            }
            else if ( this.#db_driver === `sqlite` )
            {
                const db = open({
                    filename:`${APP_PATH}/${this.#db_filename}`,
                    driver:sqlite3.Database
                })
                if (sql.toLowerCase().startsWith(`select`))
                    return (await db).all(sql)
                if (sql.toLowerCase().startsWith(`create`))
                    return (await db).run(sql)
                if (sql.toLowerCase().startsWith(`insert`))
                    return (await db).run(sql)
                if (sql.toLowerCase().startsWith(`update`))
                    return (await db).run(sql)
                if (sql.toLowerCase().startsWith(`delete`))
                    return (await db).run(sql)
                if (sql.toLowerCase().startsWith(`drop`))
                    return (await db).run(sql)
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
