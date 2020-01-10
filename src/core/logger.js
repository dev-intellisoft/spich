/**
 * Created by wellington on 27/07/2017.
 */

//let access = require('./logger').createLogger(`${process.env.PWD}/logs/access.log`)

let accesslog = require('access-log')
let fs = require('fs')

let debug = process.env.debug || 0

module.exports =
{
    access:function (req, res)
    {
        let access_token = ''

        if(req.oauth)
           access_token = req.oauth.bearerToken.accessToken

        let log_format = `USERID=":userID"; IP=":ip"; XIP=":Xip"; HOST=":host"; METHOD=":method"; PROTO=":protocol"; URL=":url"; USERAGENT=":userAgent"; PERIOD[FROM=":startDate :startTime" TO=":endDate :endTime"]; CLF=":clfDate"; DELTA=":delta"; HTTP_VERSION=":httpVersion"; REFERER=":referer"; URL_DECODED=":urlDecoded"; LENGTH=":contentLength"; ACCESS_TOKEN="${access_token}"`

        accesslog(req, res, log_format, function (data)
        {
            if(debug > 0 || debug == 'access')
            {
                console.log('')
                console.log('################ Access Log ################')
                console.log(data)
                console.log('')
            }

            fs.open(`${LOG_PATH}/access.log`, 'a', 666, function( e, id )
            {
                fs.write( id, `${data}\n`, null, 'utf8', function()
                {
                    fs.close(id, function ()
                    {
                        //console.log('file closed')
                    })
                })
            })

        })
    },

    log_zoho_request:function (config)
    {
        let method = config.method || 'GET'
        let url = config.url
        let form = config.form || ''
        let opp_access_token = config.opp_access_token || ''

        let data = `[${new Date()}] METHOD="${method}"; URL="${url}"; DATA="${form}"; ACCESS_TOKEN="${opp_access_token}";`

        fs.open(`${LOG_PATH}/zoho.log`, 'a', 666, function( e, id )
        {
            fs.write( id, `${data}\n`, null, 'utf8', function()
            {
                if(debug > 0 || debug == 'zoho')
                {
                    console.log('')
                    console.log('################ Request Log ################')
                    console.log(data)
                    console.log('')
                }

                fs.close(id, function()
                {
                    //console.log('file closed')
                })
            })
        })
    },

    log_query:function (sql)
    {
        let data = `[${new Date()}] ${sql}`

        if(debug > 0 || debug == 'sql')
        {
            console.log('')
            console.log('################ SQL Log ################')
            console.log(data)
            console.log('')
        }

        fs.open(`${LOG_PATH}/query.log`, 'a', 666, function( e, id )
        {
            fs.write( id, `${data}\n`, null, 'utf8', function()
            {
                fs.close(id, function()
                {
                    //console.log('file closed')
                })
            })
        })

    },

    error:function (error)
    {
        let data = `[${new Date()}] ${error}`

        if(debug > 0 || debug == 'error')
        {
            console.log('')
            console.log('################ Error Log ################')
            console.log(data)
            console.log('')
        }

        if ( !fs.existsSync(`${LOG_PATH}`) )
            fs.mkdirSync(`${LOG_PATH}`)


        fs.open(`${LOG_PATH}/error.log`, 'a', 666, function ( e, id )
        {
            fs.write( id, `${data}\n`, null, 'utf8', function ()
            {
                fs.close(id, function()
                {
                    //console.log('file closed')
                })
            })
        })
    }
}

