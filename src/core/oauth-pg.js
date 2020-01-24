/**
 * Created by wellington on 16/06/2017.
 */

import Database from '../core/database'

class PGOAuth2Model
{
    getClient = async ( client_id, client_secret, callback ) =>
    {
        const sql = `SELECT app_name, app_secret, redirect_uri FROM applications WHERE app_name = '${client_id}' AND app_secret = MD5('${client_secret}')`
        const result = await new Database().query(sql)
        if (!result[0])
            return callback(result)
        else
            callback(null, { clientId: result[0].app_name,  clientSecret: result[0].app_secret })
    }

    grantTypeAllowed = async ( client_id, grant_type, callback ) =>
    {
        if ( grant_type === 'password' || grant_type === 'refresh_token' )
            return callback(false, client_names.indexOf(client_id.toLowerCase()) >= 0)

        callback(false, true);
    }

    getUser = async ( username, password, callback ) =>
    {
        const sql = `SELECT user_id FROM users WHERE email = '${username}' AND password = MD5('${password}')`
        const result = await new Database().query(sql)

        if (!result[0])
            callback(false)
        else
            callback(null, result[0].user_id)
    }

    saveRefreshToken = async ( refresh_token, client_id, expires, user_id, callback) =>
    {
        const timezone = process.env.timezone || 'GMT'
        if(user_id.id) user_id = user_id.id
        expires = expires.toString().replace(/GMT.*$/,  timezone)

        const sql = `
            INSERT INTO refresh_tokens(app_id, user_id, app, refresh_token, expires)
            SELECT app_id, '${user_id}', app_name, '${refresh_token}', '${expires}'  FROM applications WHERE app_name = '${client_id}'
        `
        const result = await new Database().query(sql)
        if(!result.error)
            callback(null, result)
        else
            callback(result, false)
    }

    saveAccessToken = async ( access_token, client_id, expires, user_id, callback ) =>
    {
        const timezone = process.env.timezone || 'GMT'
        if(user_id.id) user_id = user_id.id
        expires = expires.toString().replace(/GMT.*$/, timezone)
        const sql = `INSERT INTO access_tokens(app_id, user_id, access_token, app,  expires)
            SELECT app_id, '${user_id}', '${access_token}', app_name, '${expires}'
            FROM applications WHERE app_name = '${client_id}'`
        const result = await new Database().query(sql)
        if(!result.error) callback(null, result)
        else callback(result, false)
    }

    getAccessToken = async ( bearer_token, callback ) =>
    {
        const sql = `
            SELECT at.access_token, at.app, at.expires, at.user_id, at.app_id, u.registration_id, u.organization_id
            FROM access_tokens at
            LEFT JOIN users u ON u.user_id = at.user_id WHERE access_token = '${bearer_token}'`
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
                app_id: result[0].app_id,
                registration_id: result[0].registration_id,
                organization_id:result[0].organization_id
            })
        }
    }
}

export default PGOAuth2Model