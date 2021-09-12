/**
 * Created by wellington on 16/06/2017.
 */

import Database from '../database'
import Logger from '../logger'
import fs from 'fs'

class SQLITEOAuth2Model
{
    #database
    constructor(props)
    {
        this.#database = props
    }

    getClient = async ( client_id, client_secret, callback ) =>
    {
        try
        {
            if ( await fs.existsSync(`${APP_PATH}/core/model/auth.js`) )
            {
                const pg_model = await import(`${APP_PATH}/core/model/auth`)
                const model = new pg_model.default
                if ( typeof model.getClient === `function`)
                    return await model.getClient ( client_id, client_secret, callback )
            }

            const sql = `
                SELECT 
                    app_id, app_name, app_secret, redirect_uri
                FROM 
                    applications 
                WHERE 
                    app_name = '${client_id}' 
                AND 
                    app_secret = '${client_secret}'
            `

            //todo later find a password encode to give more safety
            // app_secret = MD5('${client_secret}')
            const [ result ] = await new Database(this.#database).query(sql)

            if (!result)
                return callback(result)
            else
                callback(null, { app_id:result.app_id,  app_name: result.app_name,  clientSecret: result.app_secret, grants:[`password`, `authorization_code`, `client_credentials`, `refresh_token`] })
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    grantTypeAllowed = async ( client_id, grant_type, callback ) =>
    {
        try
        {
            if ( await fs.existsSync(`${APP_PATH}/core/model/auth.js`) )
            {
                const pg_model = await import(`${APP_PATH}/core/model/auth`)
                const model = new pg_model.default
                if ( typeof model.grantTypeAllowed === `function`)
                    return await model.grantTypeAllowed ( client_id, grant_type, callback )
            }

            if ( grant_type === `password` || grant_type === `refresh_token` )
                return callback(false, client_names.indexOf(client_id.toLowerCase()) >= 0)
            callback(false, true);
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    getUser = async ( username, password, callback ) =>
    {
        try
        {
            if ( await fs.existsSync(`${APP_PATH}/core/model/auth.js`) )
            {
                const pg_model = await import(`${APP_PATH}/core/model/auth`)
                const model = new pg_model.default
                if ( typeof model.getUser === `function`)
                    return await model.getUser ( username, password, callback )
            }

            const sql = `
                SELECT
                    user_id 
                FROM 
                    users 
                WHERE 
                    email = '${username}' 
                AND 
                    password = '${password}'
            `
            //todo later find some way to encode this password.
            //password = MD5('${password}')
            const [result] = await new Database(this.#database).query(sql)

            if (!result)
                callback(false)
            else
                callback(null, result.user_id)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    saveRefreshToken = async ( refresh_token, client_id, expires, user_id, callback ) =>
    {
        try
        {
            if ( await fs.existsSync(`${APP_PATH}/core/model/auth.js`) )
            {
                const pg_model = await import(`${APP_PATH}/core/model/auth`)
                const model = new pg_model.default
                if ( typeof model.saveRefreshToken === `function`)
                    return await model.saveRefreshToken ( refresh_token, client_id, expires, user_id, callback )
            }

            const timezone = process.env.TIMEZONE || 'GMT'
            if(user_id.id) user_id = user_id.id
            expires = expires.toString().replace(/GMT.*$/,  timezone)

            const sql = `
                INSERT INTO 
                    ${process.env.DB_SCHEMA || `public`}.refresh_tokens(app_id, user_id, app_name, refresh_token, expires)
                SELECT 
                    app_id, '${user_id}', app_name, '${refresh_token}', '${expires}'  
                FROM 
                    ${process.env.DB_SCHEMA || `public`}.applications 
                WHERE 
                    app_name = '${client_id}'
            `
            const result = await new Database(this.#database).query(sql)
            if(!result.error)
                callback(null, result)
            else
                callback(result, false)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    saveAccessToken = async ( access_token, client_id, expires, user_id, callback ) =>
    {
        try
        {
            if ( await fs.existsSync(`${APP_PATH}/core/model/auth.js`) )
            {
                const pg_model = await import(`${APP_PATH}/core/model/auth`)
                const model = new pg_model.default
                if ( typeof model.saveAccessToken === `function`)
                    return await model.saveAccessToken ( access_token, client_id, expires, user_id, callback )
            }

            const timezone = process.env.TIMEZONE || 'GMT'
            if(user_id.id) user_id = user_id.id
            expires = expires.toString().replace(/GMT.*$/, timezone)
            const sql = `
                INSERT INTO 
                    ${process.env.DB_SCHEMA || `public`}.access_tokens(
                        app_id, user_id, access_token, app_name,  expires
                    )
                SELECT 
                    app_id, '${user_id}', '${access_token}', app_name, '${expires}'
                FROM 
                    ${process.env.DB_SCHEMA || `public`}.applications 
                WHERE 
                    app_name = '${client_id}'
            `
            const result = await new Database(this.#database).query(sql)
            if(!result.error) callback(null, result)
            else callback(result, false)
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    getAccessToken = async ( bearer_token ) =>
    {
        try
        {

            if ( await fs.existsSync(`${APP_PATH}/core/model/auth.js`) )
            {
                const pg_model = await import(`${APP_PATH}/core/model/auth`)
                const model = new pg_model.default
                if ( typeof model.getAccessToken === `function`)
                    return await model.getAccessToken ( bearer_token )
            }

            const sql = `
                SELECT 
                    at.access_token, at.app_name, at.expires, at.user_id, at.app_id
                FROM 
                    access_tokens at
                LEFT JOIN 
                    users u 
                ON 
                    u.user_id = at.user_id
                WHERE 
                    access_token = '${bearer_token}'
            `
            const [ result ] = await new Database(this.#database).query(sql)

            if (result)
            {
                return {
                    accessToken: result.access_token,
                    clientId: result.app_id,
                    expires: new Date(result.expires),
                    accessTokenExpiresAt:new Date(result.expires),
                    user_id: result.user_id,
                    app_id: result.app_id,
                    app_name: result.app_name,
                    user: {
                        user_id:result.user_id
                    }
                }
            }
            else
            {
                return `error`
            }
        }
        catch ( e )
        {
            new Logger().error(e)
            return e
        }
    }

    getRefreshToken = async ( bearer_token ) =>
    {
        try
        {
            if ( await fs.existsSync(`${APP_PATH}/core/model/auth.js`) )
            {
                const pg_model = await import(`${APP_PATH}/core/model/auth`)
                const model = new pg_model.default
                if ( typeof model.getRefreshToken === `function`)
                    return await model.getRefreshToken ( bearer_token )
            }

            const sql = `
                SELECT 
                    refresh_token, app_name, expires, user_id 
                FROM 
                    refresh_tokens 
                WHERE 
                    refresh_token = '${bearer_token}'
            `

            const [ result ] = await new Database(this.#database).query(sql)

            const sql2 = `
                SELECT 
                    app_id, app_name
                FROM 
                    applications
                WHERE 
                    app_name = '${result.app_name}'
            `

            const [ client ] = await new Database(this.#database).query(sql2)


            const sql3 = `
                SELECT 
                    *
                FROM
                    users
                WHERE   
                    user_id = ${result.user_id}
            `

            const [ user ] = await new Database(this.#database).query(sql3)


            return {
                refreshToken: result.refresh_token,
                refreshTokenExpiresAt: new Date(result.expires),
                scope: [`read`, `write`],
                client: client.app_name, // with 'id' property
                user: user.user_id
            };
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }


    revokeToken = async() =>
    {
        if ( await fs.existsSync(`${APP_PATH}/core/model/auth.js`) )
        {
            const pg_model = await import(`${APP_PATH}/core/model/auth`)
            const model = new pg_model.default
            if ( typeof model.revokeToken === `function`)
                return await model.revokeToken ()
        }

        //this function should remove the token from database but to keep track action I won't do that
        return true
    }
    
    saveToken = async ( token, { app_id, app_name }, user_id ) =>
    {
        try
        {
            if ( await fs.existsSync(`${APP_PATH}/core/model/auth.js`) )
            {
                const pg_model = await import(`${APP_PATH}/core/model/auth`)
                const model = new pg_model.default
                if ( typeof model.saveToken === `function`)
                    return await model.saveToken ( token, { app_id, app_name }, user_id )
            }

            const at_expires = new Date(token.accessTokenExpiresAt).toUTCString()

            await new Database(this.#database).query(`
                INSERT INTO 
                    access_tokens
                    ( access_token, expires, app_id, app_name, user_id )
                VALUES ( '${token.accessToken}', '${at_expires}', ${app_id}, '${app_name}', ${user_id} )
--                 RETURNING access_token, expires, app_id, app_name, user_id
            `)
            const [ access_token ] = await new Database(this.#database).query(`
                SELECT 
                    access_token, expires, app_id, app_name, user_id
                FROM
                    access_tokens
                WHERE
                    access_token = '${token.accessToken}'
            `)

            const rt_expires = new Date(token.refreshTokenExpiresAt).toUTCString()

            await new Database(this.#database).query(`
                INSERT INTO
                    refresh_tokens
                    ( refresh_token, expires, app_id, app_name , user_id )
                VALUES( '${token.refreshToken}', '${rt_expires}', ${app_id}, '${app_name}', ${user_id} )
--                 RETURNING refresh_token, expires, app_id, app_name , user_id
            `)

            const [ refresh_token ] = await new Database(this.#database).query(`
                SELECT
                    refresh_token, expires, app_id, app_name , user_id
                FROM
                    refresh_tokens
                WHERE
                    refresh_token = '${token.refreshToken}'
            `)

            return {
                access_token: access_token.access_token,
                accessToken: access_token.access_token,
                refresh_token: refresh_token.refresh_token,
                access_token_expires_at: access_token.expires,
                refresh_token_expires_at: refresh_token.expires,
                scope: [ `read`, `write` ],
                client: access_token.app_name,
                app_name: access_token.app_name,
                user: access_token.user_id,
                client_id: access_token.app_id,
                user_id: access_token.user_id
            }
        }
        catch ( e )
        {
            return `error`
        }
    }
}

export default SQLITEOAuth2Model