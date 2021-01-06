/**
 * Created by wellington on 24/07/2017.
 */

import Bootstrap from './bootstrap'
import Database from './database'
import OAuth2Server from 'oauth2-server'
import PGOAuth2Model from './oauth/oauth-pg'
import MongoOAuth2Model from './oauth/oauth-mongo'
import structure from './oauth/structure'
import socketio from 'socket.io'
import logger from './logger'
import pack from '../../package.json'
import mongoose from 'mongoose'


if ( process.env.db_type === `mongo` )
{
    mongoose.set(`useCreateIndex`, true)
    mongoose.connect(process.env.mongo_uri,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify:false
    })
}

if ( !global.CTL_PATH )
    global.CTL_PATH = `${APP_PATH}/controllers`
if ( !global.MOD_PATH )
    global.MOD_PATH = `${APP_PATH}/models`
if ( !global.LIB_PATH )
    global.LIB_PATH = `${APP_PATH}/libs`
if ( !global.VIEW_PATH )
    global.VIEW_PATH = `${APP_PATH}/views`
// if ( !global.STORAGE_PATH )
//     global.STORAGE_PATH = `${APP_PATH ATH}/storage`
if ( global.LOG_PATH )
    global.LOG_PATH  = `${STORAGE_PATH}/logs`
if ( global.UPLOADS_PATH )
    global.UPLOADS_PATH  = `${STORAGE_PATH}/uploads`



class spich
{
    async run(req, res, app)
    {
        try
        {

            let project = await import(`${APP_PATH}/package.json`)
            if ( project.default )
                project = project.default

            if ( project.version )
                global.PROJECT_VERSION = project.version

            if ( pack.version )
                global.SPICH_VERSION = pack.version

            global.connections = 0



            process.on(`uncaughtException`, (err) => console.error(err))

            if ( process.env.enable_oauth === `true` )
            {
                // await new structure().init()

                global.client_names = []

                if ( process.env.db_type === `mongo` )
                {
                    const result = await MongoOAuth2Model.load_applications()

                    result.map(value => client_names.push(value.app_name))

                    app.oauth = new OAuth2Server(
                    {
                        model: MongoOAuth2Model
                    })
                }
                else if ( process.env.db_type === `postgres` )
                {
                    const result = await new Database().query(`SELECT LOWER(app_name) app_name FROM ${process.env.db_schema || `public`}.applications`)

                    result.map(value => client_names.push(value.app_name))

                    app.oauth = new OAuth2Server({ model: new PGOAuth2Model() })
                }

                const { Request, Response } = OAuth2Server


                if ( req.path === `/oauth/token` )
                {
                    try
                    {
                        new logger().access(req, res)
                        await res.send(
                            await app.oauth.token(new Request(req), new Response(res))
                        )
                    }
                    catch ( e )
                    {
                        await res.status(e.status).send(e)
                    }
                }
                else
                {
                    if ( await new Bootstrap().is_public_route(req) || await new Bootstrap().is_static_route(req) )
                    {
                        new logger().access(req, res)
                        await new Bootstrap().run(req, res)
                    }
                    else
                    {
                        try
                        {
                            req.oauth = await app.oauth.authenticate(new Request(req), new Response(res))
                            new logger().access(req, res)

                            await new Bootstrap().run(req, res)
                        }
                        catch ( e )
                        {
                            new logger().access(req, res)
                            new logger().error(e)
                            res.status(e.status).send(e)
                        }
                    }
                }
            }
            else
            {
                await res.send(await new Bootstrap ().run ( req, res ))
            }
        }
        catch ( e )
        {
            console.log ( e )
            new logger().error(e)
        }
    }
}

export default spich