/**
 * Created by wellington on 08/08/2017.
 */

const logger = require(`./logger`)

import Router from '../core/router'

class Bootstrap
{
    is_public_route = req => new Router().is_public(req)

    is_static_route = req => new Router().is_static(req)

    run = async ( req,res ) =>
    {
        global.request = req
        global.response = res

        const config = new Router().router(req)
        const class_name = config.class_name

        if (config.permission)
        {
            try
            {
                try
                {
                    const output = await config.class[config.method]()

                    logger.access(req, res)

                    if(Buffer.isBuffer(output))
                        res.set('Content-type','application/pdf')
                    else
                        res.set('Content-type','application/json')

                    res.send(output).end()
                }
                catch (ex)
                {
                    //todo module does not exists return and log
                    res.json({code:100, message:`No function '${config.method}' found in controller '${class_name}'!`}).end()
                }
            }
            catch (ex)
            {
                //todo module does not exists return and log
                res.json({code:100, message:`Controller '${class_name}' does not exists!`}).end()
            }
        }
        else
        {
            res.json({code:100, message:`Application '${config.applications.accessed}' have no permission!`}).end()
        }
    }

    get_params_names(func)
    {
        const strip_comments = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        const argument_names = /([^\s,]+)/g;

        const fn_str = func.toString().replace(strip_comments, '');
        let result = fn_str.slice(fn_str.indexOf('(')+1, fn_str.indexOf(')')).match(argument_names);

        if(result === null) result = [];

        return result;
    }
}

export default Bootstrap
