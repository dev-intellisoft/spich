import { Controller } from 'spich'

class Users extends Controller
{
    constructor (props)
    {
        super(props)
    }

    async _init()
    {
        await this.model(`users`)
    }

    async index()
    {//--disable-auth
        if ( this.is_post() )
            return await this.users_model.create(this.input.post())
        else if ( this.is_delete() )
            return await this.users_model.clean()
    }

    async revoke( access_token )
    {//--disable-auth
        return await this.users_model.revoke_access_token( access_token )
    }
}

export default Users