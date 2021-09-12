/**
 * Spich Model
 *
 * Before you start you need read database session to configure properly you database access.
 * once once you set properly your db connection you can simply run
 *      this.query(<your_sql_code_here>)
 *
 */
import { Model } from 'spich'

class {{model}} extends Model
{
    constructor(props)
    {
        super(props {{db_name}})
    }

    async your_func()
    {
        return await this.query("YOUR SQL QUERY")
    }
}

export default {{model}}