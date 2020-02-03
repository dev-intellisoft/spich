import mongoose from 'mongoose'
import Database from '../database'

class MongoOAuth2Model
{
    getAccessToken = async (access_token, callback) =>
    {
        const data = await new Database().select( `access_tokens`, { access_token } )

        if (!data[0])
        {
            callback(data)
        }
        else
        {
            callback(null,
            {
                accessToken: data[0].access_token,
                clientId: data[0].app_name,
                expires: data[0].expires,
                user_id: data[0].user_id,
                app_id: data[0].app_id
            })
        }
    }

    getRefreshToken = async ( refresh_token, callback ) =>
    {
        const result = await new Database().select( `refresh_tokens`, { refresh_token } )
        callback(null, result.length ?
            {
                userId: result[0].user_id,
                clientId: result[0].app,
                expires: result[0].expires,
                refreshToken: result[0].refresh_token,
            } : false)
    }

    saveRefreshToken = async ( refresh_token, app_name, expires, user_id, callback ) =>
    {
        const data = await new Database().insert( `refresh_tokens`, { refresh_token, app_name, user_id, expires } )
        if( data ) callback(null, data)
        else callback(true, false)
    }

    saveAccessToken = async (access_token, app_name, expires, user_id, callback) =>
    {
        const data = await new Database().insert( `access_tokens`, { access_token, app_name, user_id, expires } )
        if( data ) callback(null, data)
        else callback(true, false)
    }

    getUser = async  ( email, password, callback ) =>
    {
        const user = await new Database().select( `users`, { email, password } )
        if( user.length ) return callback(null, user[0]._id)
        return callback({ code:1, message:`some err had occured! ` })
    }

    getClient = async ( app_name, app_secret, callback ) =>
    {
        const client = await new Database().select(`applications`, { app_name, app_secret })
        if ( client.length )
            callback(null, { clientId: client[0].app_name, clientSecret: client[0].app_secret })
        else
            return callback(result)
    }

    grantTypeAllowed = async  ( client_name, grant_type, callback ) =>
    {
        if ( grant_type === `password` || grant_type === `refresh_token` )
            return callback(false, client_names.indexOf(client_name) >= 0)
        callback(false, true)
    }

    load_applications = async () => await new Database().select(`applications`)
}

export default new MongoOAuth2Model()