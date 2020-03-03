/**
 * Created by wellington on 27/07/2017.
 */


import accesslog from 'access-log'
import fs from 'fs'

const debug = process.env.debug || 0

class logger
{
    access (req, res)
    {
        const access_token = req.oauth?req.oauth.bearerToken.accessToken: ``
        const log_format = `USERID=":userID"; IP=":ip"; XIP=":Xip"; HOST=":host"; METHOD=":method"; PROTO=":protocol"; URL=":url"; USERAGENT=":userAgent"; PERIOD[FROM=":startDate :startTime" TO=":endDate :endTime"]; CLF=":clfDate"; DELTA=":delta"; HTTP_VERSION=":httpVersion"; REFERER=":referer"; URL_DECODED=":urlDecoded"; LENGTH=":contentLength"; ACCESS_TOKEN="${access_token}" DATA="${JSON.stringify(req.body)}"`

        if ( !fs.existsSync(`${LOG_PATH}`) )
            fs.mkdirSync(`${LOG_PATH}`)

        accesslog(req, res, log_format, data =>
        {
            if(debug > 0 || debug === `access`)
            {
                console.log('')
                console.log('################ Access Log ################')
                console.log(data)
                console.log('')
            }

            fs.open(`${LOG_PATH}/access.log`, 'a', 666, ( e, id ) =>
                fs.write( id, `${data}\n`, null, 'utf8', () =>
                    fs.close(id, () => {})))
        })
    }

    log_zoho_request( config )
    {
        let method = config.method || 'GET'
        let url = config.url
        let form = config.form || ''
        let opp_access_token = config.opp_access_token || ''

        let data = `[${new Date()}] METHOD="${method}"; URL="${url}"; DATA="${form}"; ACCESS_TOKEN="${opp_access_token}";`

        if( debug > 0 || debug === `zoho` )
        {
            console.log('')
            console.log('################ Request Log ################')
            console.log(data)
            console.log('')
        }

        fs.open(`${LOG_PATH}/zoho.log`, 'a', 666, ( e, id ) =>
            fs.write( id, `${data}\n`, null, 'utf8', () =>
                fs.close(id, () => {})))
    }

    log_query( sql )
    {
        let data = `[${new Date()}] ${sql}`

        if( debug > 0 || debug === `sql` )
        {
            console.log('')
            console.log('################ SQL Log ################')
            console.log(data)
            console.log('')
        }

        if ( !fs.existsSync(`${LOG_PATH}`) )
            fs.mkdirSync(`${LOG_PATH}`)

        fs.open(`${LOG_PATH}/query.log`, 'a', 666, ( e, id ) =>
            fs.write( id, `${data}\n`, null, 'utf8', () =>
                fs.close(id, () => {}) ))
    }

    error( error )
    {
        let data = `[${new Date()}] ${error}`

        if( debug > 0 || debug === `error` )
        {
            console.log('')
            console.log('################ Error Log ################')
            console.log(data)
            console.log('')
        }

        if ( !fs.existsSync(`${LOG_PATH}`) )
            fs.mkdirSync(`${LOG_PATH}`)

        fs.open(`${LOG_PATH}/error.log`, 'a', 666, ( e, id ) =>
            fs.write( id, `${data}\n`, null, 'utf8', () =>
                fs.close(id, () => {})))
    }
}

export default logger

