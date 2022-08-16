/**
 * Created by wellington on 21/07/2017.
 */
import fs from 'fs'
import Input from '../core/input'
import Logger from "./logger"

let routes = []

class Router
{
    #params = []

    #controller = `index`
    #method = `index`

    #folder = `/`
    #application_permission = false
    #client_id = ``

    router = async ( req ) =>
    {
        try
        {
            let counter = 0

            let route_to = req.path

            let permitted_applications = `*`

            route_to = route_to.split(`/`)

            // looking for controllers inside a folder
            route_to.map( ( r, index ) =>
            {
                if ( r !== `` &&  fs.existsSync(`${CTL_PATH}${this.#folder}${r}`) )
                {
                    this.#folder = `${this.#folder}${r}/`
                    counter = index
                }
            })

            counter ++

            if( route_to[ counter ])
            {
                this.#controller = route_to[ counter ]
                counter ++
            }

            let class_name = this.#controller

            if( this.#folder !== `/` )
            {
                class_name = `${this.#folder}${this.#controller}`.replace(/^\//, ``)
                class_name = class_name.split(`/`).join(`_`)
            }

            let ctl = await import(`${CTL_PATH}/${class_name}`)

            if ( ctl.default ) ctl = ctl.default

            const _controller = await new ctl

            if( route_to[ counter ] && typeof _controller[route_to[counter]] === `function` )
            {
                this.#method = route_to[counter]
                counter ++
            }

            for ( let i = counter; i < route_to.length; i++)
                this.#params.push(route_to[i])

            const input = new Input()

            if ( input.oauth() )
                this.#client_id = input.oauth(`app_name`).toLowerCase()

            if ( permitted_applications[0] === `` )
                permitted_applications[0]  = `*`

            if ( permitted_applications.includes(this.#client_id) || permitted_applications[0] === `*` )
                this.#application_permission = true

            if ( _controller.assign )
            {
                let assigned_applications = _controller.assign()

                this.#application_permission = !( assigned_applications !== undefined && assigned_applications.length && !assigned_applications.includes(this.#client_id) )
                permitted_applications = assigned_applications
            }

            const config =
            {
                public:_controller[this.#method].toString().includes(`--disable-auth`),
                _controller,
                folder:this.#folder,
                controller:this.#controller,
                class_name,
                method:this.#method,
                permission:this.#application_permission,
                applications:
                {
                    allowed: permitted_applications,
                    accessed:this.#client_id
                },
                params:this.#params
            }

            return config

        }
        catch ( e )
        {
            new Logger().error(e)
            return e
        }
    }
}

export default Router
