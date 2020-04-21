/**
 * Created by wellington on 24/07/2017.
 */

import Bootstrap from './bootstrap'
import Database from './database'
import express from 'express'
import fs from 'fs'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import https from 'spdy'
import http from 'http'
import OAuth2Server from 'oauth2-server'
import PGOAuth2Model from './oauth/oauth-pg'
import MongoOAuth2Model from './oauth/oauth-mongo'
import structure from './oauth/structure'
import socketio from 'socket.io'
import logger from './logger'
import fileUpload from 'express-fileupload'
import pack from '../../package.json'

// import uuid from "uuid/v4"

class spich
{
    async run()
    {
        global.CTL_PATH = `${APP_PATH}/controllers`
        global.MOD_PATH = `${APP_PATH}/models`
        global.LIB_PATH = `${APP_PATH}/libs`
        global.VIEW_PATH = `${APP_PATH}/views`
        global.STORAGE_PATH = `${APP_PATH}/storage`
        global.LOG_PATH  = `${STORAGE_PATH}/logs`
        global.UPLOADS_PATH  = `${STORAGE_PATH}/uploads`

        try
        {
            const app = express()
            app.use(helmet())
            app.disable(`x-powered-by`)
            app.set(`trust_proxy`, true);
            app.use(cors())
            app.use(bodyParser.json())
            app.use(bodyParser.urlencoded({extended: false}))
            app.use(fileUpload())
            app.use('/uploads', express.static(UPLOADS_PATH))

            let project = await import(`${APP_PATH}/package.json`)
            if ( project.default )
                project = project.default

            if ( project.version )
                global.PROJECT_VERSION = project.version

            if ( pack.version )
                global.SPICH_VERSION = pack.version

            global.connections = 0

            if ( process.env.ssl === `true` )
            {
                const port = process.env.server_port || 443

                const credentials =
                {
                    key: fs.readFileSync(process.env.ssl_key, process.env.ssl_charset),
                    cert: fs.readFileSync(process.env.ssl_cert, process.env.ssl_charset),
                    passphrase: process.env.ssl_pass
                }

                var https_server = https.createServer(credentials, app) //added

                https_server.listen(port)
                console.log(`######################################################################`)
                console.log(`#                      Welcome  to ${project.name}                           #`)
                console.log(`#      Description ${project.description}                            #`)
                console.log(`#      This server is running on port ${port} in SSL Mode                 #`)
                console.log(`#      Powered by ${pack.name} (${pack.version})                     #`)
                console.log(`######################################################################`)
            }
            else
            {
                const port = process.env.server_port || 80

                var http_server = http.createServer(app)
                http_server.listen(port)

                console.log(`######################################################################`)
                console.log(`#                      Welcome  to ${project.name}                           #`)
                console.log(`#      Description ${project.description}                            #`)
                console.log(`#      This server is running on port ${port} in NO SSL Mode               #`)
                console.log(`#      Powered by ${pack.name} (${pack.version})                      #`)
                console.log(`######################################################################`)
            }


            global.io = socketio(http_server)

            io.on('connection', (socket) =>
            {
                connections = socket.client.conn.server.clientsCount
                console.clear()
                console.log(`Connections +# ${connections} `)

                console.log()
            })

            io.on('disconnect', () =>
            {
                connections --
                console.clear()
                console.log(`Connections -# ${connections} `)
            })

            process.on(`uncaughtException`, (err) => console.error(err))

            if ( process.env.enable_oauth === `true` )
            {
                await new structure().init()

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

                    app.oauth = new OAuth2Server( { model: new PGOAuth2Model() })
                }

                const { Request, Response } = OAuth2Server


                app.all(`/socket.io`, (req, res) => res.send(``))

                app.all(`/oauth/token`,
                    async (req, res) =>
                    {
                        try
                        {
                            new logger().access(req, res)
                            res.send(
                                await app.oauth.token(new Request(req), new Response(res))
                            )
                        }
                        catch ( e )
                        {
                            res.status(e.status).send(e)
                        }
                    }
                )

                app.all(`*`,  async (req, res, next) =>
                {
                    if ( await new Bootstrap().is_public_route(req) || await new Bootstrap().is_static_route(req) )
                    {
                        new logger().access(req, res)
                        await new Bootstrap().run(req, res)
                    }
                    else
                    {
                        next()
                    }
                })

                app.all(/^(?:(?!\/?.*uploads).*)/,
                    async (req, res) =>
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
                )
            }
            else
            {
                app.all(`*`,  async (req, res) => await new Bootstrap().run(req, res))
            }
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }
}

export default spich