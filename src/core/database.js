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
        // if ( process.env.db_type === `mongo` )
        // {
        //     mongoose.set(`useCreateIndex`, true)
        //     mongoose.connect(process.env.mongo_uri, {
        //         useUnifiedTopology: true,
        //         useNewUrlParser: true,
        //         useFindAndModify:false
        //     })
        // }
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
            new logger().error(e)
        }
    }

    select = async ( collection, where={}, one = false ) =>
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
            new logger().error(e)
            return e
        }
    }

    select_partial = async ( collection, where, part, one ) =>
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
            new logger().error(e)
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
            new logger().error(e)
            return e
        }
    }

    update = async ( collection, data, where, many = false ) =>
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
            new logger().error(e)
            return e
        }
    }

    delete = async ( collection, where, many = false ) =>
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
            new logger().error(e)
            return e
        }
    }

    query = async sql =>
    {
        try
        {
            if ( global.server.get(`db_type`) === `postgres` )
            {
                return new Promise(function (resolve, reject)
                {
                    const user = `${global.server.get(`db_user`) || process.env.USER}`
                    const pass = `${global.server.get(`db_pass`) || ''}`
                    const host = `${global.server.get(`db_host`) || 'localhost'}`
                    const base = `${global.server.get(`db_base`) || ''}`

                    if ( !global.server.get(`db_user`) )
                        logger.error(`Your '.env' file seem to have no database users '${process.env.USER}' will be take`)
                    if ( !global.server.get(`db_pass`) )
                        logger.error(`It seems in '.env' file have no password for database user '${user}', blank will be taken as default!`)
                    if ( !global.server.get(`db_host`) )
                        logger.error(`No hostname was specified in your '.env' file '${host}' will be taken`)
                    if ( !global.server.get(`db_base`) )
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
            else if ( global.server.get(`db_type`) === `mysql` )
            {

            }
            else
            {
                console.log(`To you use some database you need to set up it's configuration on you ".env" file`)
                return { code: `ERR`, message:`Database configuration error!` }
            }
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }
}

export default Database
