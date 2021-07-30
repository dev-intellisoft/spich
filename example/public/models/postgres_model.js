/**
 * Spich Model
 *
 * Before you start you need read database session to configure properly you database access.
 * once once you set properly your db connection you can simply run
 *      this.query(<your_sql_code_here>)
 *
 */
import { Model } from 'spich'

class Postgres_Model extends Model
{
    constructor(props)
    {
        super(props, `postgres0`)
    }

    async create( table, field )
    {
        try
        {
            const sql = `CREATE TABLE ${table} (${field} VARCHAR(50))`
            return await this.query( sql )
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
            return await this.query( sql )
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
            const sql = `UPDATE ${table} SET ${field} = '${value}'`
            return await this.query( sql )
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
            const sql = `SELECT ${field} FROM ${table}`
            return await this.query( sql )
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
            const sql = `DELETE FROM ${table}`
            return await this.query( sql )
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
            const sql = `DROP TABLE ${table}`
            return await this.query( sql )
        }
        catch (e)
        {
            console.log(e)
            return e
        }
    }
}

export default Postgres_Model