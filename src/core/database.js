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
import logger from './logger'
import Pool from 'pg-pool'



var models = []

class  Database
{
    constructor()
    {
        if ( process.env.db_type === `mongo` )
        {
            mongoose.connect(process.env.mongo_uri, {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useFindAndModify:false
            })
        }
    }

    load = async ( collection ) =>
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

    select = async ( collection, where={}, one = false ) =>
    {
        try
        {
            const model = await this.load(collection)

            if (one)
                return await model.findOne(where)
            else
                return await model.find(where)
        }
        catch (e)
        {
            console.log(`Error: `, e)
            return e
        }
    }

    insert = async ( collection, data ) =>
    {
        try
        {
            const model = await this.load(collection)
            collection = new model(data)
            return await collection.save()
        }
        catch (e)
        {
            console.log(`Error: `, e)
            return e
        }
    }

    update = async ( collection, data, where ) =>
    {
        try
        {
            const model = await this.load(collection)
            await model.findOneAndUpdate(where, data)
            return await model.find(where)
        }
        catch (e)
        {
            console.log(`Error: `, e)
            return e
        }
    }

    delete = async ( collection, where ) =>
    {
        try
        {
            const model = await this.load(collection)
            return await model.findOneAndRemove(where)
        }
        catch (e)
        {
            console.log(`Error: `, e)
            return e
        }
    }

    query = async sql =>
    {
        if ( process.env.db_type === `postgres` )
        {
            return new Promise(function (resolve, reject)
            {
                const user = `${process.env.db_user || process.env.USER}`
                const pass = `${process.env.db_pass || ''}`
                const host = `${process.env.db_host || 'localhost'}`
                const base = `${process.env.db_base || ''}`

                if ( !process.env.db_user )
                    logger.error(`Your '.env' file seem to have no database users '${process.env.USER}' will be take`)
                if ( !process.env.db_pass )
                    logger.error(`It seems in '.env' file have no password for database user '${user}', blank will be taken as default!`)
                if ( !process.env.db_host )
                    logger.error(`No hostname was specified in your '.env' file '${host}' will be taken`)
                if ( !process.env.db_base )
                    logger.error(`It seems you have no database set in your '.env' file blank will be taken`)

                const config =
                {
                    user:user,
                    password:pass,
                    host:host,
                    database:base,
                    max:10,
                    idleTimeoutMillis: 1000,
                }

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
                        new logger().log_query(sql)

                        new logger().error(`You have some error while try to run "${sql}" in your database!`)

                        if ( err.code === `28000` )
                            resolve({ code:err.code, message:`INVALID AUTHORIZATION SPECIFICATION` })

                        resolve(err)
                    }
                    else
                    {
                        if ( typeof result === undefined ) resolve([])

                        new logger().log_query(sql)
                        resolve(result.rows)
                    }
                })
            })
        }
        else if ( process.env.db_type === `mysql` )
        {

        }
        else
        {
            console.log(`To you use some database you need to set up it's configuration on you ".env" file`)
            return { code: `ERR`, message:`Database configuration error!` }
        }
    }
}

export default Database
