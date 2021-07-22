import { Controller } from 'spich'

class Index extends Controller
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
     * To use them you simpy:
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
     *      and all you html files must be in ./views folder
     */
    async index()
    {
        return this.view(`index`)
    }

    async fruits()
    {
        return await this.test_model.fruits()
    }

    async sum()
    {
        try
        {
            const number = await this.test_lib.sum(10, 20)

            return { number }
        }
        catch (e)
        {
            console.log(e)
            return  e.message
        }
    }
}

export default Index