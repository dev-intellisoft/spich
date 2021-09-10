/**
 * Spich Model
 *
 * Before you start you need read database session to configure properly you database access.
 * once once you set properly your db connection you can simply run
 *      this.query(<your_sql_code_here>)
 *
 */
import { Model } from 'spich'

class Users_Model extends Model
{
    constructor(props)
    {
        super(props, `postgres0`)
    }

    async create({ email, username, password })
    {
        try
        {
            const sql = `
                INSERT INTO users(email, username, password)
                VALUES ('${email}', '${username}', '${password}')
                RETURNING email, username
            `
            return await this.query(sql)
        }
        catch (e)
        {
            return e
        }
    }

    async clean()
    {
        try
        {
            await this.query(`
                DELETE FROM access_tokens
            `)
            return await this.query(`
                DELETE FROM users
            `)
        }
        catch (e)
        {
            return  e
        }
    }

    async revoke_access_token( access_token )
    {
        try
        {
            let [{ expires }] = await this.query(`
                SELECT expires FROM access_tokens WHERE access_token = '${access_token}'
            `)
            expires = new Date(expires)
            expires = new Date(new Date(expires).setHours(expires.getHours() - 2))
            const sql = `
                UPDATE
                    access_tokens
                SET
                    expires = '${expires}'
                WHERE
                    access_token = '${access_token}'
            `
            return await this.query(sql)
        }
        catch (e)
        {
            return e
        }
    }
}

export default Users_Model