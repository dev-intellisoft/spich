/**
 * Created by wellington on 09/08/2017.
 */


import  Database from './database'

class Model extends Database
{
    constructor(props)
    {
        super(props)
        if ( global.server.get(`db_type`) === `postgres` )
        {
            delete this.select
            delete this.insert
            delete this.update
            delete this.delete
        }
    }
}

export default  Model
