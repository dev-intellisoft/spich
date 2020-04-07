import Database from '../database'
import bcrypt from 'bcryptjs'
import logger from '../logger'

class MongoOAuth2Model
{
    getAccessToken = async (access_token) =>
    {
        try
        {
            const token = await new Database().select( `access_tokens`, { access_token }, true )
            const client = await new Database().select( `applications`, { _id:token.app_name }, true )
            const user = await new Database().select( `users`, { _id:token.user_id } )

            return {
                accessToken: token.access_token,
                accessTokenExpiresAt: token.expires,
                user_id:token.user_id,
                app_name:client.app_name,
                scope: token.scope,
                client: client,
                user: user
            }
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }

    saveToken = async (token, client, user) =>
    {
        const access_token = await new Database().insert( `access_tokens`, {
            access_token: token.accessToken,
            expires: token.accessTokenExpiresAt,
            // scope: token.scope,
            app_name: client.id,
            user_id: user.id
        })

        const refesh_token = await new Database().insert( `refresh_tokens`, {
            refresh_token: token.refreshToken,
            expires: token.refreshTokenExpiresAt,
            // scope: token.scope,
            app_name: client.id,
            user_id: user.id
        } )

        return {
            access_token: access_token.access_token,
            accessToken: access_token.access_token,
            refresh_token: refesh_token.refresh_token,
            access_token_expires_at: access_token.expires,
            refresh_token_expires_at: refesh_token.expires,
            scope: [`read`, `write`],
            client: access_token.app_name,
            user: access_token.user_id,
            client_id: access_token.app_name,
            user_id: access_token.user_id
        }
    }


    getUser = async ( email, password ) =>
    {
        try
        {
            const user = await new Database().select( `users`, { email }, true )
            if( await bcrypt.compare(password, user.password) )
                return user
            return { code:1, message:`Invalid username and/or password! ` }
        }
        catch ( e )
        {
            console.log ( e )
            new logger().error(e)
        }
    }

    async getClient( app_name, app_secret )
    {
        try
        {
            const client = await new Database().select(`applications`, { app_name, app_secret }, true)

            return {
                id: client.id,
                redirectUris: client.redirect_url,
                grants: client.grants
            }
        }
        catch ( e )
        {
            console.log ( e )
            new logger().error(e)
        }
    }

    getRefreshToken = async( refresh_token ) =>
    {
        const refresh = await new Database().select( `refresh_tokens`, { refresh_token }, true )
        const user = await new Database().select( `users`, { "_id":refresh.user_id }, true )
        const client = await new Database().select( `applications`, { "_id":refresh.app_name }, true )

        return {
            refreshToken: refresh.refresh_token,
            refreshTokenExpiresAt: refresh.expires_at,
            scope: refresh.scope,
            client: client, // with 'id' property
            user: user
        }
    }

    revokeToken = async() =>
    {
        //this function should remove the token from database but to keep track action I won't do that
        return true
    }

    load_applications = async () =>
    {
        try
        {
            return await new Database().select(`applications`)
        }
        catch ( e )
        {
            new logger().error(e)
        }

    }
}

export default new MongoOAuth2Model()