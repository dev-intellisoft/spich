import { Loader } from 'spich'
class Auth extends Loader
{
    constructor (props)
    {
        super(props, `sqlite0`)
    }

    getClient = async ( client_id, client_secret, callback ) =>
    {
        try
        {
            await this.model(`auth`)
            const [ result ] = await this.auth_model.getClient( client_id, client_secret )

            if (!result)
                return callback(result)

            return callback(null, { app_id:result.app_id,  app_name: result.app_name,  clientSecret: result.app_secret, grants:[`password`, `authorization_code`, `client_credentials`, `refresh_token`] })
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    grantTypeAllowed = async () =>
    {
        try
        {
            await this.model(`auth`)
            const result = await this.auth_model.grantTypeAllowed()
            return result
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    getUser = async ( username, password, callback ) =>
    {
        try
        {
            await this.model(`auth`)
            const [ result ] = await this.auth_model.getUser( username, password )
            if (!result)
                return callback(false)

            return callback(null, result.user_id)
        }
        catch (e)
        {
            return e
        }
    }
    saveRefreshToken = async () =>
    {
        try
        {
            await this.model(`auth`)
            const result = await this.auth_model.saveRefreshToken()
            return result
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    saveAccessToken = async () =>
    {
        try
        {
            await this.model(`auth`)
            const result = await this.auth_model.saveAccessToken()
            return result
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    getAccessToken = async ( bearer_token ) =>
    {
        try
        {
            await this.model(`auth`)
            const result = await this.auth_model.getAccessToken( bearer_token )
            return result
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    getRefreshToken = async () =>
    {
        try
        {
            await this.model(`auth`)
            const result = await this.auth_model.getRefreshToken()
            return result
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    revokeToken = async () =>
    {
        try
        {
            await this.model(`auth`)
            const result = await this.auth_model.revokeToken()
            return result
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    saveToken = async ( token, { app_id, app_name }, user_id  ) =>
    {
        try
        {
            await this.model(`auth`)
            const result = await this.auth_model.saveToken(token, { app_id, app_name }, user_id)
            return result
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
}

export default Auth