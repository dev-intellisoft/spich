/**
 * Created by wellington on 16/06/2017.
 */

import Database from '../database'
import logger from '../logger'
import fs from 'fs'

class PGOAuth2Model
{
    getClient = async ( client_id, client_secret, callback ) =>
    {
        try
        {
            const sql = `
                SELECT 
                    app_id, app_name, app_secret, redirect_uri
                FROM 
                    ${global.server.get(`db_schema`) || `public`}.applications 
                WHERE 
                    app_name = '${client_id}' 
                AND 
                    app_secret = MD5('${client_secret}')
            `

            const result = await new Database().query(sql)

            if (!result[0])
                return callback(result)
            else
                callback(null, { app_id:result[0].app_id,  app_name: result[0].app_name,  clientSecret: result[0].app_secret, grants:[`password`, `authorization_code`, `client_credentials`, `refresh_token`] })
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }

    grantTypeAllowed = async ( client_id, grant_type, callback ) =>
    {
        try
        {
            if ( grant_type === `password` || grant_type === `refresh_token` )
                return callback(false, client_names.indexOf(client_id.toLowerCase()) >= 0)
            callback(false, true);
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }

    getUser = async ( username, password, callback ) =>
    {
        try
        {
            const sql = `
                SELECT 
                    user_id 
                FROM 
                    ${global.server.get(`db_schema`) || `public`}.users 
                WHERE 
                    email = '${username}' 
                AND 
                    password = MD5('${password}')`
            const result = await new Database().query(sql)

            if (!result[0])
                callback(false)
            else
                callback(null, result[0].user_id)
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }

    saveRefreshToken = async ( refresh_token, client_id, expires, user_id, callback) =>
    {
        try
        {
            const timezone = global.server.get(`timezone`) || 'GMT'
            if(user_id.id) user_id = user_id.id
            expires = expires.toString().replace(/GMT.*$/,  timezone)

            const sql = `
                INSERT INTO 
                    ${global.server.get(`db_schema`) || `public`}.refresh_tokens(app_id, user_id, app_name, refresh_token, expires)
                SELECT 
                    app_id, '${user_id}', app_name, '${refresh_token}', '${expires}'  
                FROM 
                    ${global.server.get(`db_schema`) || `public`}.applications 
                WHERE 
                    app_name = '${client_id}'
            `
            const result = await new Database().query(sql)
            if(!result.error)
                callback(null, result)
            else
                callback(result, false)
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }

    saveAccessToken = async ( access_token, client_id, expires, user_id, callback ) =>
    {
        try
        {
            const timezone = global.server.get(`timezone`) || 'GMT'
            if(user_id.id) user_id = user_id.id
            expires = expires.toString().replace(/GMT.*$/, timezone)
            const sql = `
                INSERT INTO 
                    ${global.server.get(`db_schema`) || `public`}.access_tokens(
                        app_id, user_id, access_token, app_name,  expires
                    )
                SELECT 
                    app_id, '${user_id}', '${access_token}', app_name, '${expires}'
                FROM 
                    ${global.server.get(`db_schema`) || `public`}.applications 
                WHERE 
                    app_name = '${client_id}'
            `
            const result = await new Database().query(sql)
            if(!result.error) callback(null, result)
            else callback(result, false)
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }

    getAccessToken = async ( bearer_token ) =>
    {
        try
        {

            if ( await fs.existsSync(`${APP_PATH}/core/model/oauth-pg.js`) )
            {
                const pg_model = await import(`${APP_PATH}/core/model/oauth-pg`)

                const model = new pg_model.default

                if ( typeof model.getAccessToken === `function`)
                    return await model.getAccessToken ( bearer_token )
            }

            const sql = `
                SELECT 
                    at.access_token, at.app_name, at.expires, at.user_id, at.app_id
                FROM 
                    ${global.server.get(`db_schema`) || `public`}.access_tokens at
                LEFT JOIN 
                    ${global.server.get(`db_schema`) || `public`}.users u 
                ON 
                    u.user_id = at.user_id
                WHERE 
                    access_token = '${bearer_token}'
            `
            const result = await new Database().query(sql)

            if (!result[0])
            {
                return `erro`
            }
            else
            {
                return {
                    accessToken: result[0].access_token,
                    clientId: result[0].app_id,
                    expires: result[0].expires,
                    accessTokenExpiresAt:result[0].expires,
                    user_id: result[0].user_id,
                    app_id: result[0].app_id,
                    app_name: result[0].app_name,
                    user: {
                        user_id:result[0].user_id
                    }
                }
            }
        }
        catch ( e )
        {
            new logger().error(e)
            return e
        }
    }

    getRefreshToken = async ( bearer_token ) =>
    {
        console.log ( 7 )
        try
        {
            if ( await fs.existsSync(`${APP_PATH}/core/model/oauth-pg.js`) )
            {
                const pg_model = await import(`${APP_PATH}/core/model/oauth-pg`)

                const model = new pg_model.default

                if ( typeof model.getRefreshToken === `function`)
                    return await model.getRefreshToken ( bearer_token )
            }
            
            const sql = `
                SELECT 
                    refresh_token, app_name, expires, user_id 
                FROM 
                    ${global.server.get(`db_schema`) || `public`}.refresh_tokens 
                WHERE 
                    refresh_token = '${bearer_token}'
            `

            const [ result ] = await new Database().query(sql)

            const sql2 = `
                SELECT 
                    app_id, app_name
                FROM 
                    ${global.server.get(`db_schema`) || `public`}.applications
                WHERE 
                    app_name = '${result.app_name}'
            `

            const [ client ] = await new Database().query(sql2)


            const sql3 = `
                SELECT 
                    *
                FROM
                    ${global.server.get(`db_schema`) || `public`}.users
                WHERE   
                    user_id = ${result.user_id}
            `

            const [ user ] = await new Database().query(sql3)


            return {
                refreshToken: result.refresh_token,
                refreshTokenExpiresAt: result.expires,
                scope: [`read`, `write`],
                client: client.app_name, // with 'id' property
                user: user.user_id
            };
        }
        catch ( e )
        {
            console.log ( e )
            new logger().error(e)
        }
    }


    revokeToken = async() =>
    {
        console.log ( 8 )
        //this function should remove the token from database but to keep track action I won't do that
        return true
    }
    
    saveToken = async (token, { app_id, app_name }, user_id ) =>
    {
        console.log ( 9 )
        try
        {
            const at_expires = new Date(token.accessTokenExpiresAt).toUTCString()

                console.log(`
                INSERT INTO 
                    ${global.server.get(`db_schema`) || `public`}.access_tokens
                    ( access_token, expires, app_id, app_name, user_id )
                VALUES ( '${token.accessToken}', '${at_expires}', ${app_id}, '${app_name}', ${user_id} )
                RETURNING access_token, expires, app_id, app_name, user_id
            `)
            const [ access_token ] = await new Database().query(`
                INSERT INTO 
                    ${global.server.get(`db_schema`) || `public`}.access_tokens
                    ( access_token, expires, app_id, app_name, user_id )
                VALUES ( '${token.accessToken}', '${at_expires}', ${app_id}, '${app_name}', ${user_id} )
                RETURNING access_token, expires, app_id, app_name, user_id
            `)

            console.log ( access_token )

            const rt_expires = new Date(token.refreshTokenExpiresAt).toUTCString()

            const [ refresh_token ] = await new Database().query(`
                INSERT INTO
                    ${global.server.get(`db_schema`) || `public`}.refresh_tokens
                    ( refresh_token, expires, app_id, app_name , user_id )
                VALUES( '${token.refreshToken}', '${rt_expires}', ${app_id}, '${app_name}', ${user_id} )
                RETURNING refresh_token, expires, app_id, app_name , user_id
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
            return `erro`
        }
    }
}

export default PGOAuth2Model