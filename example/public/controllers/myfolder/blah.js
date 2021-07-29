import { Controller } from 'spich'

class Blah extends Controller
{
    constructor()
    {
        super()
    }

    async index()
    {
        return `OK`
    }
}

export default Blah