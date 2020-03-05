/**
 * Created by wellington on 16/06/2017.
 */

import Database from '../database'
import logger from '../logger'

class PGOAuth2Model
{
    getClient = async ( client_id, client_secret, callback ) =>
    {
        try
        {
            const sql = `
            SELECT 
                app_name, app_secret, redirect_uri 
            FROM 
                ${process.env.db_schema || `public`}.applications 
            WHERE 
                app_name = '${client_id}' 
            AND 
                app_secret = MD5('${client_secret}')
        `
            const result = await new Database().query(sql)
            if (!result[0])
                return callback(result)
            else
                callback(null, { clientId: result[0].app_name,  clientSecret: result[0].app_secret })
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
                ${process.env.db_schema || `public`}.users 
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
            const timezone = process.env.timezone || 'GMT'
            if(user_id.id) user_id = user_id.id
            expires = expires.toString().replace(/GMT.*$/,  timezone)

            const sql = `
            INSERT INTO 
                ${process.env.db_schema || `public`}.refresh_tokens(app_id, user_id, app, refresh_token, expires)
            SELECT 
                app_id, '${user_id}', app_name, '${refresh_token}', '${expires}'  
            FROM 
                ${process.env.db_schema || `public`}.applications 
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
            const timezone = process.env.timezone || 'GMT'
            if(user_id.id) user_id = user_id.id
            expires = expires.toString().replace(/GMT.*$/, timezone)
            const sql = `
            INSERT INTO 
                ${process.env.db_schema || `public`}.access_tokens(
                    app_id, user_id, access_token, app,  expires
                )
            SELECT 
                app_id, '${user_id}', '${access_token}', app_name, '${expires}'
            FROM 
                ${process.env.db_schema || `public`}.applications 
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

    getAccessToken = async ( bearer_token, callback ) =>
    {
        try
        {
            const sql = `
            SELECT 
                at.access_token, at.app, at.expires, at.user_id, at.app_id
            FROM 
                ${process.env.db_schema || `public`}.access_tokens at
            LEFT JOIN 
                ${process.env.db_schema || `public`}.users u 
            ON 
                u.user_id = at.user_id
            WHERE 
                access_token = '${bearer_token}'
        `
            const result = await new Database().query(sql)

            if (!result[0])
            {
                callback(result)
            }
            else
            {
                callback(null,
                    {
                        accessToken: result[0].access_token,
                        clientId: result[0].app,
                        expires: result[0].expires,
                        user_id: result[0].user_id,
                        app_id: result[0].app_id
                    })
            }
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }

    getRefreshToken = async ( bearer_token, callback ) =>
    {
        try
        {
            const sql = `
            SELECT 
                refresh_token, app, expires, user_id 
            FROM 
                ${process.env.db_schema || `public`}.refresh_tokens 
            WHERE 
                refresh_token = '${bearer_token}'
        `
            const result = await new Database().query(sql)
            callback(null, result.length ?
                {
                    userId: result[0].user_id,
                    clientId: result[0].app,
                    expires: result[0].expires,
                    refreshToken: result[0].refresh_token,
                } : false)
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }
}

export default PGOAuth2Model