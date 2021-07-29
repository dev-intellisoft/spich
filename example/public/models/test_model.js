/**
 * Spich Model
 *
 * Before you start you need read database session to configure properly you database access.
 * once once you set properly your db connection you can simply run
 *      this.query(<your_sql_code_here>)
 *
 */
import { Model } from 'spich'

class Test_Model extends Model
{
    constructor(props)
    {
        super(props)
    }

    async test( param )
    {
        return param
    }
}

export default Test_Model