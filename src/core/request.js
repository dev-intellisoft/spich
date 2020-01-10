/**
 * Created by wellington on 19/07/2017.
 */
let request = require('request')
let pdf = require('html-pdf')
let logger = require(`${process.env.PWD}/core/logger`)

export async function my_request(config)
{
    let request_url = config.url
    let method = config.method || 'get'

    let headers = {'Authorization': process.env.zoho_authtoken}
    if(config.headers) headers =  config.headers


    return new Promise((resolve, reject) =>
    {
        if(method == 'post' || method == 'put')
        {
            logger.log_zoho_request(config)
            if(config.json)
            {

                request[method]
                (
                    {
                        url: request_url, headers: headers, json:config.form
                    },
                    function (err, resp, body)
                    {
                        let response = (typeof body)?body:JSON.parse(body)

                        if (config.form.is_mailchimp)  resolve(response)

                        if(resp.statusCode == opp.http.OK || resp.statusCode == opp.http.CREATED || resp.statusCode == opp.http.ACCEPTED)
                        {
                            resolve(response)
                        }
                        else
                        {
                            //todo treat this error
                            resolve(
                            {
                                code:10000,
                                message:'review this error code in core function'
                            })
                        }
                    }
                )
            }
            else if(config.formData)
            {
                request[method]
                (
                    {
                        url: request_url, headers: headers, formData:config.form
                    },
                    function (err, resp, body)
                    {
                        let response = (typeof body)?body:JSON.parse(body)

                        if (config.form.is_mailchimp)  resolve(response)

                        if(resp.statusCode == opp.http.OK || resp.statusCode == opp.http.CREATED || resp.statusCode == opp.http.ACCEPTED )
                        {
                            resolve(response)
                        }
                        else if (resp.statusCode == 400)
                        {
                            resolve(response)
                        }
                        else
                        {

                            //todo treat this error
                            resolve(
                            {
                                code:10000,
                                message:'review this error code in core function'
                            })
                        }
                    }
                )
            }
            else
            {
                request[method]
                (
                    {
                        url: request_url, headers: headers, form: config.form
                    },
                    function (err, resp, body)
                    {
                        if (resp.statusCode == opp.http.OK || resp.statusCode == opp.http.CREATED || resp.statusCode == opp.http.ACCEPTED)
                        {
                            resolve(JSON.parse(body))
                        }
                        else if(resp.statusCode == opp.http.BAD_REQUEST)
                        {
                            resolve(JSON.parse(body))
                        }
                        else
                        {
                            let response = JSON.parse(body)

                            if(response.code)
                                resolve(response)
                            else
                            //todo treat this error
                            resolve(
                            {
                                code:10000,
                                message:'review this error code in core function'
                            })
                        }
                    }
                )
            }
        }
        else
        {
            logger.log_zoho_request(config)
            request[method]
            (
                {
                    url: request_url, headers: headers
                },
                function (err, resp, body)
                {

                    if (resp.statusCode == opp.http.OK)
                    {
                        if(config.accept == 'pdf')
                        {
                            pdf.create(body).toBuffer(function(err, buffer)
                            {
                                resolve(buffer)
                            });
                        }
                        else
                        {
                            resolve(JSON.parse(body))
                        }
                    }
                    else if(resp.statusCode == opp.http.BAD_REQUEST)
                    {
                        resolve(JSON.parse(body))
                    }
                    else
                    {
                        let response = JSON.parse(body)
                        if(response.code)
                            resolve(response)
                        else
                        //todo treat this error
                            resolve(
                            {
                                code:10000,
                                message:'review this error code in core function'
                            })
                    }
                }
            )
        }
    })
}
