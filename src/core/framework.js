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
import oauthserver from 'oauth2-server'
import PGOAuth2Model from './oauth/oauth-pg'
import structure from './oauth/structure'

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
        }


        process.on(`uncaughtException`, (err) => console.error(err))


        if ( process.env.enable_oauth === `true` )
        {

            await new structure().create_application_sequence()
            await new structure().create_application_table()
            await new structure().grant_application_sequence_permission()
            await new structure().grant_applicaition_table_permission()

            await new structure().create_user_sequence()
            await new structure().create_user_table()
            await new structure().grant_user_sequence_permission()
            await new structure().grant_user_table_permission()

            await new structure().create_access_token_table()
            await new structure().grant_access_token_table_permission()

            await new structure().create_refresh_token_table()
            await new structure().grant_refresh_token_permission()

            global.client_names = []
            const result = await new Database().query(`SELECT LOWER(app_name) app_name FROM ${process.env.db_schema || `public`}.applications`)

            result.map(value => client_names.push(value.app_name))

            app.oauth = oauthserver(
                {
                    model: new PGOAuth2Model(),
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