/**
 * Spich Model
 *
 * Before you start you need read database session to configure properly you database access.
 * once once you set properly your db connection you can simply run
 *      this.query(<your_sql_code_here>)
 *
 */
import { Model } from 'spich'

class Sqlite_Model extends Model
{
    constructor(props)
    {
        super(props)
    }

    async create( table, field )
    {
        try
        {
            const sql = `CREATE TABLE ${table} (${field} VARCHAR(50))`
            return await this.query(sql)
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }

    async insert( table, field,  value)
    {
        try
        {
            const sql = `INSERT INTO ${table} (${field}) VALUES('${value}')`
            return await this.query(sql)
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }

    async update( table, field, value )
    {
        try
        {
            return await this.query(`UPDATE ${table} SET ${field} = '${value}'`)
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }

    async select( table, field )
    {
        try
        {
            return await this.query(`SELECT ${field} FROM ${table}`)
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }

    async delete( table )
    {
        try
        {
            return await this.query(`DELETE FROM ${table}`)
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }

    async drop ( table )
    {
        try
        {
            console.log(`DROP TABLE ${table}`)
            return await this.query(`DROP TABLE ${table}`)
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
}

export default Sqlite_Model