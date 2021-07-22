import { Controller } from 'spich'

class {{controller}} extends Controller
{
    constructor (props)
    {
        super(props)
    }

    async _init()
    {
        {{loaders}}
    }

    async index()
    {
        return this.view(`{{view}}`)
    }
}

export default {{controller}}