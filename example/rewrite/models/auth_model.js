/**
 * Spich Model
 *
 * Before you start you need read database session to configure properly you database access.
 * once once you set properly your db connection you can simply run
 *      this.query(<your_sql_code_here>)
 *
 */
import { Model } from 'spich'

class Auth_Model extends Model
{
    constructor(props)
    {
        super(props , `sqlite0`)
    }

    getClient = async ( client_id, client_secret ) =>
    {
        console.log(1)
        try
        {
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
            return await this.query(sql)
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    grantTypeAllowed = async () =>
    {
        console.log(2)
        try
        {
            const sql = ``
            return await this.query(sql)
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    getUser = async ( username, password ) =>
    {
        console.log(3)
        try
        {
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
            return await this.query(sql)
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    saveRefreshToken = async () =>
    {
        console.log(4)
        try
        {
            const sql = ``
            return await this.query(sql)
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    saveAccessToken = async () =>
    {
        console.log(5)
        try
        {
            const sql = ``
            return await this.query(sql)
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    getAccessToken = async ( bearer_token ) =>
    {
        console.log(6)
        try
        {
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
            return await this.query(sql)
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    getRefreshToken = async ( bearer_token ) =>
    {
        console.log(7)
        try
        {
            const sql = `
                SELECT 
                    refresh_token, app_name, expires, user_id 
                FROM 
                    refresh_tokens 
                WHERE 
                    refresh_token = '${bearer_token}'
            `

            const [ result ] = await this.query(sql)

            const sql2 = `
                SELECT 
                    app_id, app_name
                FROM 
                    applications
                WHERE 
                    app_name = '${result.app_name}'
            `

            const [ client ] = await this.query(sql2)


            const sql3 = `
                SELECT 
                    *
                FROM
                    users
                WHERE   
                    user_id = ${result.user_id}
            `

            const [ user ] = await this.query(sql3)


            return {
                refreshToken: result.refresh_token,
                refreshTokenExpiresAt: new Date(result.expires),
                scope: [`read`, `write`],
                client: client.app_name, // with 'id' property
                user: user.user_id
            }
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    revokeToken = async () =>
    {
        console.log(8)
        try
        {
            const sql = ``
            return await this.query(sql)
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
    saveToken = async ( token, { app_id, app_name }, user_id ) =>
    {
        console.log(9)
        try
        {
            const at_expires = new Date(token.accessTokenExpiresAt).toUTCString()

            await this.query(`
                INSERT INTO 
                    access_tokens
                    ( access_token, expires, app_id, app_name, user_id )
                VALUES ( '${token.accessToken}', '${at_expires}', ${app_id}, '${app_name}', ${user_id} )
--                 RETURNING access_token, expires, app_id, app_name, user_id
            `)

            const [ access_token ] = await this.query(`
                SELECT 
                    access_token, expires, app_id, app_name, user_id
                FROM
                    access_tokens
                WHERE
                    access_token = '${token.accessToken}'
            `)

            const rt_expires = new Date(token.refreshTokenExpiresAt).toUTCString()

            await this.query(`
                INSERT INTO
                    refresh_tokens
                    ( refresh_token, expires, app_id, app_name , user_id )
                VALUES( '${token.refreshToken}', '${rt_expires}', ${app_id}, '${app_name}', ${user_id} )
--                 RETURNING refresh_token, expires, app_id, app_name , user_id
            `)

            const [ refresh_token ] = await this.query(`
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
        catch (e)
        {
            console.log(e)
            return e
        }
    }
}

export default Auth_Model