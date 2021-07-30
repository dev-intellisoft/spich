import dotenv from 'dotenv'
import { Controller } from 'spich'

class Postgre extends Controller
{
    constructor ()
    {
        super()
    }

    async _init()
    {
        await this.model(`postgres`)
    }

    async index( table, field )
    {
        dotenv.config({ path:`.env.postgres` })
        try
        {
            if ( this.is_patch() )
                return await this.postgres_model.create( table, field )

            if ( this.is_post() )
                return await this.postgres_model.insert( table, field, this.input.post(`value`) )

            if ( this.is_get() )
                return await this.postgres_model.select( table, field )

            if ( this.is_put() )
                return await this.postgres_model.update( table, field, this.input.put(`value`) )

            if ( this.is_delete() )
                return await this.postgres_model.delete( table )

            if ( this.is_head() )
                return await this.postgres_model.drop( table )
        }
        catch (e)
        {
            console.log(e)
            return `ERR`
        }
    }
}

export default Postgre