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
import structure from './oauth/structure'
import socketio from 'socket.io'
import Logger from './logger'
import fileUpload from 'express-fileupload'
import pack from '../../package.json'
import Router from './router'

class Spich
{
    #config
    #app = express()
    #project
    #server
    #port = 80
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
            this.#app.use(helmet())
            this.#app.disable(`x-powered-by`)
            this.#app.set(`trust_proxy`, true);
            this.#app.use(cors())
            this.#app.use(bodyParser.json())
            this.#app.use(bodyParser.text())
            this.#app.use(bodyParser.urlencoded({extended: false}))
            this.#app.use(fileUpload())
            this.#app.use('/uploads', express.static(UPLOADS_PATH))

            this.#project = await import(`${APP_PATH}/package.json`)
            if ( this.#project.default )
                this.#project = this.#project.default

            if ( this.#project.version )
                global.PROJECT_VERSION = this.#project.version

            if ( pack.version )
                global.SPICH_VERSION = pack.version

            global.connections = 0

            if ( process.env.SSL === `true` )
            {
                 this.#port = process.env.SERVER_PORT || 443

                const credentials =
                {
                    key: fs.readFileSync(process.env.SSL_KEY, process.env.SSL_CHARSET),
                    cert: fs.readFileSync(process.env.SSL_CERT, process.env.SSL_CHARSET),
                    passphrase: process.env.SSL_PASS
                }

                 this.#server = https.createServer(credentials, this.#app) //added

                this.#server.listen(this.#port)
                console.log(`######################################################################`)
                console.log(`#                      Welcome  to ${this.#project.name}                           #`)
                console.log(`#      Description ${this.#project.description?this.#project.description:`(no description)`}                            #`)
                console.log(`#      This server is running on port ${this.#port} in SSL Mode                 #`)
                console.log(`#      Powered by ${pack.name} (${pack.version})                     #`)
                console.log(`######################################################################`)
            }
            else
            {
                this.#port = process.env.SERVER_PORT || 80

                this.#server = http.createServer(this.#app)
                this.#server.listen(this.#port)

                console.log(`######################################################################`)
                console.log(`#                      Welcome  to ${this.#project.name}                           #`)
                console.log(`#      Description ${this.#project.description?this.#project.description:`(no description)`}                             #`)
                console.log(`#      This server is running on port ${this.#port} in NO SSL Mode               #`)
                console.log(`#      Powered by ${pack.name} (${pack.version})                                      #`)
                console.log(`######################################################################`)
            }


            global.io = socketio(this.#server)

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

            if ( process.env.ENABLE_OAUTH === `true` )
            {
                global.client_names = []

                if ( process.env.DB_TYPE === `postgres` )
                {
                    const result = await new Database().query(`SELECT LOWER(app_name) app_name FROM ${process.env.DB_SCHEMA || `public`}.applications`)

                    result.map(value => client_names.push(value.app_name))

                    this.#app.oauth = new OAuth2Server( { model: new PGOAuth2Model() })
                }

                const { Request, Response } = OAuth2Server

                //todo if socket io is have too many problems may be you need see this.
                // app.all(`/socket.io`, (req, res) => res.send(``))

                this.#app.post(`/oauth/token`, async (req, res) =>
                {
                    try
                    {
                        new Logger().access(req, res)
                        res.send(await this.#app.oauth.token(new Request(req), new Response(res)))
                    }
                    catch ( e )
                    {
                        res.status(e.status).send(e)
                    }
                })

                this.#app.all(`*`,  async (req, res, next) =>
                {
                    global.request = req
                    global.response = res

                    this.#config = await new Router().router(req)

                    if ( this.#config.public )
                    {
                        new Logger().access(req, res)
                        await new Bootstrap().run(this.#config, res)
                        global.request = null
                        global.response = null
                    }
                    else
                    {
                        next()
                    }
                })

                this.#app.all(/^(?:(?!\/?.*uploads).*)/,
                    async (req, res) =>
                    {
                        try
                        {
                            req.oauth = await this.#app.oauth.authenticate(new Request(req), new Response(res))
                            global.request = req
                            global.response = res
                            new Logger().access(req, res)
                            this.#config = await new Router().router(req)

                            await new Bootstrap().run(this.#config, res)
                            global.request = null
                            global.response = null
                        }
                        catch ( e )
                        {
                            new Logger().access(req, res)
                            new Logger().error(e)
                            res.status(e.status).send(e)
                        }
                    }
                )
            }
            else
            {
                this.#app.all(`*`,  async (req, res) =>
                {
                    global.request = req
                    global.response = res
                    this.#config = await new Router().router(req)

                    await new Bootstrap().run(this.#config, res)
                    global.request = null
                    global.response = null
                })
            }
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }
}

export default Spich