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

class framework
{
    async run()
    {
        const app = express()
        app.use(helmet())
        app.disable(`x-powered-by`)
        app.set(`trust_proxy`, true);
        app.use(cors())
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({extended: false}))

        if ( process.env.ssl === `true` )
        {
            const port = process.env.server_port || 443

            const credentials =
                {
                    key: fs.readFileSync(process.env.ssl_key, process.env.ssl_charset),
                    cert: fs.readFileSync(process.env.ssl_cert, process.env.ssl_charset),
                    passphrase: process.env.ssl_pass
                }

            const https_server = https.createServer(credentials, app) //added

            https_server.listen(port)
            console.log(`######################################################################`)
            console.log(`#                      Welcome  to ${process.env.server_api_name}                           #`)
            console.log(`#      Description ${process.env.server_name}                            #`)
            console.log(`#      The server is running on port ${port} in SSL Mode                 #`)
            console.log(`######################################################################`)
        }
        else
        {
            const port = process.env.server_port || 80

            const http_server = http.createServer(app)
            http_server.listen(port)

            console.log(`######################################################################`)
            console.log(`#                      Welcome  to ${process.env.server_api_name}                           #`)
            console.log(`#      Description ${process.env.server_name}                            #`)
            console.log(`#      The server is running on port ${port} in NO SSL Mode               #`)
            console.log(`######################################################################`)

            console.log(`The server was started at port ${port}`)
        }


        process.on(`uncaughtException`, (err) =>
        {
            console.error(err)
            console.log(`Node NOT Exiting...`)
        })


        if ( process.env.enable_oauth === `true` )
        {
            global.client_names = []
            const result = await new Database().query(`SELECT LOWER(app_name) app_name FROM applications`)
            result.map(value => client_names.push(value.app_name))

            const oauthserver = require('oauth2-server')
            app.oauth = oauthserver(
                {
                    model: require(`${CORE_PATH}/oauth-pg`),
                    grants: [`auth_code`, `password`, `refresh_token`],
                    debug: true
                })

            app.all(`/oauth/token`, app.oauth.grant())

            app.all(`*`,  (req, res, next) =>
            {
                if (new Bootstrap().is_public_route(req) || new Bootstrap().is_static_route(req))
                    new Bootstrap().run(req, res)
                else
                    next()
            })

            app.all(/^(?:(?!\/?.*uploads).*)/, app.oauth.authorise(), (req, res) => new Bootstrap().run(req, res))

            app.use(app.oauth.errorHandler());
        }
        else
        {
            app.all(`*`,  (req, res) => new Bootstrap().run(req, res))
        }
    }
}

export default framework