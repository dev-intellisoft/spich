import { Controller } from 'spich'

class Sqlite extends Controller
{
    constructor (props)
    {
        super(props)
    }

    async _init()
    {
        await this.model(`sqlite`)
    }

    async index( table, field )
    {//--disable-auth
        try
        {
            if ( this.is_patch() )
                return await this.sqlite_model.create( table, field )

            if ( this.is_post() )
                return await this.sqlite_model.insert( table, field, this.input.post(`value`) )

            if ( this.is_get() )
                return await this.sqlite_model.select( table, field )

            if ( this.is_put() )
                return await this.sqlite_model.update( table, field, this.input.put(`value`) )

            if ( this.is_delete() )
                return await this.sqlite_model.delete( table )

            if ( this.is_head() )
                return await this.sqlite_model.drop( table )
        }
        catch (e)
        {
            console.log(e)
            return `ERR`
        }
    }
}

export default Sqlite