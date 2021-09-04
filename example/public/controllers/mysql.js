import { Controller } from 'spich'

class Mysql extends Controller
{
    constructor ()
    {
        super()
    }

    async _init()
    {
        await this.model(`mysql`)
    }

    async index( table, field )
    {//--disable-auth
        try
        {
            if ( this.is_patch() )
                return await this.mysql_model.create( table, field )

            if ( this.is_post() )
                return await this.mysql_model.insert( table, field, this.input.post(`value`) )

            if ( this.is_get() )
                return await this.mysql_model.select( table, field )

            if ( this.is_put() )
                return await this.mysql_model.update( table, field, this.input.put(`value`) )

            if ( this.is_delete() )
                return await this.mysql_model.delete( table )

            if ( this.is_head() )
                return await this.mysql_model.drop( table )
        }
        catch (e)
        {
            console.log(e)
            return `ERR`
        }
    }
}

export default Mysql