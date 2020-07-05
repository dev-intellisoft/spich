import { controller } from 'spich'

class {{controller}} extends controller
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