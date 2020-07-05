import { controller } from 'spich'

class index extends controller
{
    constructor ()
    {
        super()
    }

    async _init()
    {

    }

    async index()
    {
        return this.view(`index`)
    }
}

export default index