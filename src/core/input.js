/**
 * Created by wellington on 15/11/2017.
 */

import logger from './logger'

class Input
{
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
            new logger().error(e)
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
            new logger().error(e)
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
                for (const blah in key) request.oauth.bearerToken[`${blah}`] = key[blah]
            }
            else
            {
                if(!key)
                {
                    return request.oauth !== undefined? request.oauth.bearerToken: undefined
                }
                else
                {
                    return request.oauth !== undefined? request.oauth.bearerToken[`${key}`] : undefined
                }
            }
        }
        catch ( e )
        {
            new logger().error(e)
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

    my_ip = () =>
    {
        return request.connection.remoteAddress
    }
}

export default Input