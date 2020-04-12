/**
 * Created by wellington on 27/07/2017.
 */


import accesslog from 'access-log'
import fs from 'fs'
import moment from 'moment'
const debug = process.env.debug || 0

class logger
{
    access = (req, res) =>
    {
        const access_token = req.oauth?req.oauth.accessToken: ``
        const user_id = req.oauth?req.oauth.user_id: ``
        const log_format = `USERID="${user_id}"; IP=":ip"; XIP=":Xip"; HOST=":host"; METHOD=":method"; PROTO=":protocol"; URL=":url"; USERAGENT=":userAgent"; PERIOD[FROM=":startDate :startTime" TO=":endDate :endTime"]; CLF=":clfDate"; DELTA=":delta"; HTTP_VERSION=":httpVersion"; REFERER=":referer"; URL_DECODED=":urlDecoded"; LENGTH=":contentLength"; ACCESS_TOKEN="${access_token}"; DATA="${JSON.stringify(req.body)}; SPICH_VERSION=${SPICH_VERSION}; PROJECT_VESION=${PROJECT_VERSION}"`

        if ( !fs.existsSync(`${LOG_PATH}`) )
            fs.mkdirSync(`${LOG_PATH}`)

        accesslog(req, res, log_format, data =>
        {
            if(debug > 0 || debug === `access`)
            {
                console.log(``)
                console.log(`################ Access Log ################`)
                console.log(data)
                console.log(``)
            }

            fs.open(`${LOG_PATH}/access_${moment().format('YYYY-MM-DD')}.log`, `a`, 666, ( e, id ) =>
                fs.write( id, `${data}\n`, null, `utf8`, () =>
                    fs.close(id, () => {})))
        })
    }

    log_query = ( sql ) =>
    {
        const data = `[${new Date()}; SPICH_VERSION=${SPICH_VERSION}; PROJECT_VESION=${PROJECT_VERSION}] ${sql}`

        if( debug > 0 || debug === `sql` )
        {
            console.log(``)
            console.log(`################ SQL Log ################`)
            console.log(data)
            console.log(``)
        }

        if ( !fs.existsSync(`${LOG_PATH}`) )
            fs.mkdirSync(`${LOG_PATH}`)

        fs.open(`${LOG_PATH}/query_${moment().format('YYYY-MM-DD')}.log`, 'a', 666, ( e, id ) =>
            fs.write( id, `${data}\n`, null, 'utf8', () =>
                fs.close(id, () => {}) ))
    }

    error = ( error ) =>
    {
        const data = `[${new Date()}] ${error.stack || error }`

        if( debug > 0 || debug === `error` )
        {
            console.log(``)
            console.log(`################ Error Log ################`)
            console.log(data)
            console.log('')
        }

        if ( !fs.existsSync(`${LOG_PATH}`) )
            fs.mkdirSync(`${LOG_PATH}`)

        fs.open(`${LOG_PATH}/error_${moment().format('YYYY-MM-DD')}.log`, 'a', 666, ( e, id ) =>
            fs.write( id, `${data}\n`, null, 'utf8', () =>
                fs.close(id, () => {})))
    }
}

export default logger

