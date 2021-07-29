/**
 * Created by wellington on 09/08/2017.
 */


import  Database from './database'

class Model extends Database
{
    constructor()
    {
        super()
        if ( process.env.DB_TYPE === `postgres` || process.env.DB_TYPE === `sqlite` || process.env.DB_TYPE === `mysql` )
        {
            delete this.select
            delete this.insert
            delete this.update
            delete this.delete
        }
    }
}

export default  Model
