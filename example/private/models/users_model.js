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
        super(props, `sqlite0`)
    }

    async create({ email, username, password })
    {
        try
        {
            const sql = `
                INSERT INTO users(email, username, password)
                VALUES ('${email}', '${username}', '${password}')
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
            const sql = `
                DELETE FROM users
            `
            return await this.query(sql)
        }
        catch (e)
        {
            console.log(`~~~~~~~~~~>`, e)
            return  e
        }
    }
}

export default Users_Model