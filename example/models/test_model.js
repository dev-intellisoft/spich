import { Model } from 'spich'

class Test_Model extends Model
{
    constructor(props)
    {
        super(props)
    }

    async fruits()
    {
        return {
            fruits:[ `apple`, `orange`, `banana`]
        }
    }
}

export default Test_Model