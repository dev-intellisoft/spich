/**
 * Created by wellington on 26/07/2017.
 */


import loadable from './loadable'
import Logger from './logger'

import mustache from  'mustache'
import fs from 'fs'

class Loader
{
    model = async model_name =>
    {
        try
        {
            const { config:{ databases } } = await import(`${APP_PATH}/config`)
            let _model = await import(`${MOD_PATH}/${model_name}_model`)
            if ( _model.default ) _model = _model.default
            this[`${model_name}_model`] = new _model(databases)
        }
        catch ( e )
        {
            console.log ( e )
            new Logger().error(e)
        }
    }

    controller = async controller_name =>
    {
        try
        {
            let _controller = await import(`${CTL_PATH}/${controller_name}`)
            if ( _controller.default ) _controller = _controller.default
            this[`${controller_name}`] = new _controller()
        }
        catch ( e )
        {
            console.log ( e )
            new Logger().error(e)
        }
    }

    lib = async library_name =>
    {
        try
        {
            let _library = await import(`${LIB_PATH}/${library_name}_lib`)
            if ( _library.default ) _library = _library.default
            this[`${library_name}_lib`] = new _library()
        }
        catch ( e )
        {
            console.log ( e )
            new Logger().error(e)
        }
    }

    load = class_name =>
    {
        try
        {
            this[`${class_name}`] = new loadable[`${class_name}`]()
        }
        catch ( e )
        {
            console.log ( e )
            new Logger().error(e)
        }
    }

    view = ( view_name,data ) =>
    {
        try
        {
            if(!data)  data = {}
            let content = fs.readFileSync(`${VIEW_PATH}/${view_name}.html`, 'utf8');

            mustache.parse(content)
            return  mustache.render( content,data )
        }
        catch ( e )
        {
            console.log ( e )
            new Logger().error(e)
        }
    }
}

export default Loader

