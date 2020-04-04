/**
 * Created by wellington on 08/08/2017.
 */

import logger from './logger'
import Router from '../core/router'

class Bootstrap
{
    is_public_route = req =>
    {
        try
        {
            return new Router().is_public(req)
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }

    is_static_route = req =>
    {
        try
        {
            return new Router().is_static(req)
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }

    run = async ( req, res ) =>
    {
        try
        {
            global.request = req
            global.response = res

            const config = await new Router().router(req)

            if ( !config )
            {
                res.set(`Content-type`, `application/json`)
                return res.json({code:100, message:`Server Error!`}).end()
            }

            const { class_name, _controller, method, permission, applications } = config

            if ( permission )
            {
                try
                {
                    await _controller._init()
                    const output = await _controller[method]()

                    new logger().access(req, res)
                    
                    if (  Boolean(res.get(`html`)) )
                        res.set(`Content-type`, `text/html`)
                    else if( Buffer.isBuffer(output) )
                        res.set(`Content-type`, `application/pdf`)
                    else
                        res.set(`Content-type`, `application/json`)

                    res.send(output).end()
                }
                catch (ex)
                {
                    //todo module does not exists return and log
                    res.json({code:100, message:`No function '${method}' found in controller '${class_name}'!`}).end()
                }
            }
            else
            {
                res.json({code:100, message:`Application '${applications.accessed}' have no permission!`}).end()
            }
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }

    get_params_names(func)
    {
        try
        {
            const strip_comments = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
            const argument_names = /([^\s,]+)/g;

            const fn_str = func.toString().replace(strip_comments, ``);
            let result = fn_str.slice(fn_str.indexOf(`(`)+1, fn_str.indexOf(`)`)).match(argument_names);

            if(result === null) result = [];

            return result;
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }
}

export default Bootstrap
