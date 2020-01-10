/**
 * Created by wellington on 15/11/2017.
 */

class Input
{
    post = key =>
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

    put = key =>
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

    get = key =>
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

    params = key =>
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

    oauth = key =>
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