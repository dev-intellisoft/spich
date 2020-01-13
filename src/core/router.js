/**
 * Created by wellington on 21/07/2017.
 */
import fs from 'fs'
import Input from '../core/input'

let routes = []

class Router
{
    constructor()
    {
        this.register = []
        try
        {
            this.register = require(`${APP_PATH}/register`)

            if (fs.existsSync(`${APP_PATH}/.conf/routes.json`))
                routes = require(`${APP_PATH}/.conf/routes.json`)
        }
        catch (e)
        {
            console.log(e)
            console.log(`Error: Can not find '${APP_PATH}/register.js'`)
        }
    }

    is_public = req =>
    {
        let route_to = req.path
        for (let key in routes)
            if( req.path.startsWith(key) )
                route_to = routes[key]
        let regex = new RegExp(`{\\*}`)
        return regex.test(route_to)
    }

    is_static = req => ( req.path === `/favicon.ico` )

    router = req =>
    {
        let params = {}
        let route_to = req.path

        let controller = `index`
        let method = `index`

        let folder = `/`
        let counter = 0
        let application_permission = false
        let client_id = ``

        // check if the path have some route set in router.json
        for (let key in routes)  if(req.path.startsWith(key)) route_to = routes[key]

        let url_params = route_to

        // check if some have some pre-assigned application set in the router.json
        let permitted_applications = route_to.substring(route_to.lastIndexOf(`{`)+1,route_to.lastIndexOf(`}`)).replace(/\s/g,`}`).split(`,`)

        route_to = route_to.replace(/\{.*\}/, '') // remove the pre-assignment declaration from the variable to avoid fake route

        //todo check why this route is remove the last character of the route
        let argument = route_to.slice(0,route_to.indexOf(`:`)).split(`/`)

        let params_arr =  route_to.match(/:(\w+(\_)?\w+)\?/g)

        let url = req.path.split(`/`)
        // extracting parameters from url
        if( params_arr )
        {
            for ( let i = 0; i < params_arr.length; i++ )
            {
                let param_name =  params_arr[i].replace(`:`, ``).replace(`?`, ``)
                params[param_name] = url[ i + argument.length - 2 ]
            }
        }

        // removing parameters declaration from route to avoid confusing in routing process
        route_to = route_to.replace(/\/\:.*\?/, ``).split(`/`)

        // #routing process
        route_to.map( ( r, index ) =>
        {
            if ( r !== `` &&  fs.existsSync(`${CTL_PATH}${folder}${r}`) )
            {
                folder = `${folder}${r}/`
                counter = index
            }
        })

        counter ++

        url_params = url_params.replace(folder, ``)

        if( route_to[ counter ])
        {
            controller = route_to[ counter ]
            url_params = url_params.replace(`${controller}/`, ``)
            counter ++
            url_params = url_params.replace(controller, ``)
        }

        let class_name = controller

        if( folder !== `/` )
        {
            class_name = `${folder}${controller}`.replace(/^\//, ``)
            class_name = class_name.split(`/`).join(`_`)
        }


        if ( this.register[class_name] !== undefined )
        {
            const _class = new this.register[class_name]

            if( route_to[ counter ] && typeof _class[route_to[counter]] === `function` )
            {
                method = route_to[counter]
                url_params = url_params.replace( `${method}/`, `` )
                counter ++
                url_params = url_params.replace( method, `` )
            }

            if( typeof _class.params === `function` )
            {
                let param_values = url_params.split(`/`)

                let param_keys = _class.params()
                for (let i = 0; i < param_keys.length; i ++) params[param_keys[i]] = param_values[i + 1]
            }

            global.parameters = params

            const input = new Input()

            if( input.oauth() )
                client_id = input.oauth(`clientId`).toLowerCase()

            if( permitted_applications[0] === `` )
                permitted_applications[0]  = `*`

            if( permitted_applications.includes(client_id) || permitted_applications[0] === `*` )
                application_permission = true

            if ( this.register[class_name].assign )
            {
                let assigned_applications = this.register[class_name].assign()

                application_permission = !( assigned_applications !== undefined && assigned_applications.length && !assigned_applications.includes(client_id) )
                permitted_applications = assigned_applications
            }

            console.log( `Params ->`, params )
            console.log( `Permitted applications ->`, permitted_applications )

            const config =
            {
                _class:_class,
                folder:folder,
                controller:controller,
                class_name:class_name,
                method:method,
                permission:application_permission,
                applications:
                {
                    allowed: permitted_applications,
                    accessed:client_id
                },
                params:params
            }

            return config
        }
        else
        {
            return null
        }
    }
}

export default Router
