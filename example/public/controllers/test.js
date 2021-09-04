import { Controller } from 'spich'

class Test extends Controller
{
    constructor (props)
    {
        super(props)
    }

    /**
     * You can load your models and libs here
     * Eg.:
     *      await this.model(`test`) // for ./models/test_model.js
     *      await this.lib(`test`) // for ./libs/test_lib.js
     *      ...
     * To use them you simply:
     *      this.test_model.<my_model_function> // for the model you loaded
     *      and
     *      this.test_lib.<my_lib_function> // for the lib you loaded
     */
    async _init()
    {
        await this.model(`test`)
        await this.lib(`test`)
    }

    /**
     * You can return to spich renderer your json when you are working with rest api
     * Eg.:
     *      return { "name":"Wellington", "age":37, "gender":"male" }
     *
     * or you can return your html using "view" function
     * Eg.:
     *      return this.view(`index`)
     * PS:
     *      Don't need add *.html when you are calling your html files and all html files
     *      and all you html files must be in ./views folder.
     *
     *      sometime some await will be required.
     */
    async index( type, param )
    {//--disable-auth
        if ( type === `models` )
            return await this.test_model.test(param)
        if ( type === `libs` )
            return await this.test_lib.test(param)

        return type

        // return this.view(`test`)
    }

    async methods ()
    {//--disable-auth
        /**
         * testing http methods
         */
        if ( this.is_get() )
            return `GET`
        if ( this.is_post() )
            return `POST`
        if ( this.is_put() )
            return `PUT`
        if ( this.is_patch() )
            return `PATCH`
        if ( this.is_delete() )
            return  `DELETE`
    }

    async returns(param)
    {//--disable-auth
        if ( this.is_post() )
            return this.input.post(param)
        if ( this.is_put() )
            return this.input.put(param)
        if ( this.is_patch() )
            return this.input.patch(param)
    }
}

export default Test