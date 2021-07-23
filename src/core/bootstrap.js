/**
 * Created by wellington on 08/08/2017.
 */

import Logger from './logger'
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
            console.log ( e )
            new Logger().error(e)
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
            console.log ( e )
            new Logger().error(e)
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

            const { class_name, _controller, method, permission, applications, params } = config

            if ( permission )
            {
                try
                {
                    await _controller._init()
                    const output = await _controller[method].apply(this, params)

                    if ( output.toString().startsWith(`<`) === true )
                        res.set(`Content-type`, `text/html`)
                    else if ( Boolean(res.get(`html`)) )
                        res.set(`Content-type`, `text/html`)
                    else if( Buffer.isBuffer(output) )
                        res.set(`Content-type`, `application/pdf`)
                    else
                        res.set(`Content-type`, `application/json`)

                    res.send(output).end()
                }
                catch ( e )
                {
                    console.log ( e )
                    new Logger().error(e)
                    //todo module does not exists return and log
                    res.json({code:100, message:`No function '${method}' found in controller '${class_name}'!`}).end()
                }
            }
            else
            {
                console.log ( e )
                new Logger().error(e)
                res.json({code:100, message:`Application '${applications.accessed}' have no permission!`}).end()
            }
        }
        catch ( e )
        {

            console.log ( e )
            new Logger().error(e)
        }
    }
}

export default Bootstrap
