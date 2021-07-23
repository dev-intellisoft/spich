/**
 * Created by wellington on 08/08/2017.
 */

import Logger from './logger'
import Router from '../core/router'

class Bootstrap
{
    #output
    run = async ( { _controller, method, params }, res ) =>
    {
        try
        {
            await _controller._init()
            this.#output = await _controller[method].apply(_controller, params)

            if ( this.#output.toString().startsWith(`<`) === true )
                res.set(`Content-type`, `text/html`)
            else if ( Boolean(res.get(`html`)) )
                res.set(`Content-type`, `text/html`)
            else if( Buffer.isBuffer(this.#output) )
                res.set(`Content-type`, `application/pdf`)
            else
                res.set(`Content-type`, `application/json`)

            res.send(this.#output).end()
        }
        catch ( e )
        {
            new Logger().error(e)
            return e
            //todo module does not exists return and log
            // res.json({code:100, message:`No function '${method}' found in controller '${class_name}'!`}).end()
        }
    }
}

export default Bootstrap
