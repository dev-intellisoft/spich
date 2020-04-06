/**
 * Created by wellington on 21/07/2017.
 */
import fs from 'fs'
import Input from '../core/input'
import logger from "spich/src/core/logger"

let routes = []

class Router
{

    static_routes = async () =>
    {
        try
        {
            if (fs.existsSync(`${APP_PATH}/.conf/routes.json`))
            {
                routes = await import(`${APP_PATH}/.conf/routes.json`)

                if ( routes.default !== undefined )
                    routes = routes.default
            }
        }
        catch (e)
        {
            new logger().error(e)
        }
    }

    is_public = async req =>
    {
        try
        {
            await this.static_routes()
            let route_to = req.path

            for (let key in routes)
                if( req.path.startsWith(key) )
                    route_to = routes[key]
            let regex = new RegExp(`{\\*}`)

            return regex.test(route_to)
        }
        catch ( e )
        {
            new logger().error(e)
        }
    }

    is_static = req => ( req.path === `/favicon.ico` )

    router = async ( req ) =>
    {
        try
        {
            await this.static_routes()

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

            route_to = route_to.replace(/\{.*\}/, ``) // remove the pre-assignment declaration from the variable to avoid fake route

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

            let ctl = await import(`${CTL_PATH}/${class_name}`)

            if ( ctl.default ) ctl = ctl.default

            const _controller = new ctl

            if( route_to[ counter ] && typeof _controller[route_to[counter]] === `function` )
            {
                method = route_to[counter]
                url_params = url_params.replace( `${method}/`, `` )
                counter ++
                url_params = url_params.replace( method, `` )
            }

            if( typeof _controller.params === `function` )
            {
                let param_values = url_params.split(`/`)

                let param_keys = _controller.params()
                for (let i = 0; i < param_keys.length; i ++)
                    params[param_keys[i]] = param_values[i]
            }

            global.parameters = params

            const input = new Input()

            if ( input.oauth() )
                client_id = input.oauth(`app_name`).toLowerCase()

            if ( permitted_applications[0] === `` )
                permitted_applications[0]  = `*`

            if ( permitted_applications.includes(client_id) || permitted_applications[0] === `*` )
                application_permission = true

            if ( _controller.assign )
            {
                let assigned_applications = _controller.assign()

                application_permission = !( assigned_applications !== undefined && assigned_applications.length && !assigned_applications.includes(client_id) )
                permitted_applications = assigned_applications
            }

            const config =
            {
                _controller, folder, controller, class_name, method,
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
        catch ( e )
        {
            console.log ( e )
            new logger().error(e)
        }
    }
}

export default Router
