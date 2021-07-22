/**
 * Created by wellington on 15/11/2017.
 */

import Logger from './logger'

class Input
{
    file = key =>
    {
        try
        {
            if(typeof key === 'object')
            {
                for (const blah in key) request.files[`${blah}`] = key[blah]
            }
            else
            {
                if(!key)  return request.files
                else return request.files[`${key}`]
            }
        }
        catch ( e )
        {
            console.log ( e )
            new Logger().error(e)
        }
    }

    post = key =>
    {
        try
        {
            if(typeof key === 'object')
            {
                for (const blah in key) request.body[`${blah}`] = key[blah]
            }
            else
            {
                if(!key)  return request.body
                else return request.body[`${key}`]
            }
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }

    put = key =>
    {
        try
        {
            if(typeof key === 'object')
            {
                for (const blah in key) request.body[`${blah}`] = key[blah]
            }
            else
            {
                if(!key)  return request.body
                else return request.body[`${key}`]
            }
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    patch = key =>
    {
        try
        {
            if(typeof key === 'object')
            {
                for (const blah in key) request.body[`${blah}`] = key[blah]
            }
            else
            {
                if(!key)  return request.body
                else return request.body[`${key}`]
            }
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    get = key =>
    {
        try
        {
            if(typeof key === 'object')
            {
                for (const blah in key) request.query[`${blah}`] = key[blah]
            }
            else
            {
                if(!key)  return request.query
                else return request.query[`${key}`]
            }
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    params = key =>
    {
        try
        {
            if(typeof key === 'object')
            {
                for (const blah in key) parameters[`${blah}`] = key[blah]
            }
            else
            {
                if(!key)  return parameters
                else return parameters[`${key}`]
            }
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }

    oauth = key =>
    {
        try
        {
            if(typeof key === 'object')
            {
                for (const blah in key) request.oauth[`${blah}`] = key[blah]
            }
            else
            {
                if(!key)
                    return request.oauth !== undefined? request.oauth: undefined
                else
                    return request.oauth !== undefined? request.oauth[`${key}`] : undefined
            }
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    headers = key =>
    {
        try
        {
            if(typeof key === 'object')
            {
                for (const blah in key) request.headers[`${blah}`] = key[blah]
            }
            else
            {
                if(!key)
                    return request.headers !== undefined? request.headers: undefined
                else
                    return request.headers !== undefined? request.headers[`${key}`] : undefined
            }
        }
        catch ( e )
        {
            new Logger().error(e)
        }
    }

    server = key =>
    {
        if(!key)
        {

        }
        else
        {

        }
    }

    remote_ip = () =>
    {
        return request.connection.remoteAddress
    }
}

export default Input