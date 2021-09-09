import { Controller } from 'spich'

class Index extends Controller
{
    constructor (props)
    {
        super(props)
    }

    async _init()
    {
        
    }

    async index()
    {
        return `OK`
    }
}

export default Index