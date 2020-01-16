/**
 * Created by wellington on 26/07/2017.
 */


import loadable from './loadable'

class Loader
{
    model = model_name =>
    {
        try
        {
            this[`${model_name}_model`] = new register[`${model_name}_model`]()
        }
        catch ( e )
        {
            console.log(`Can not find model '${model_name}'`, e)
        }
    }

    controller = controller_name =>
    {
        try
        {
            this[`${controller_name}`] = new register[`${controller_name}`]()
        }
        catch ( e )
        {
            console.log(`Can not find controller '${controller_name}'`, e)
        }
    }

    lib = library_name =>
    {
        try
        {
            this[`${library_name}_lib`] = new register[`${library_name}_lib`]()
        }
        catch ( e )
        {
            console.log(`Can not find library '${library_name}'`, e)
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
            console.log(`Can not find class '${class_name}'`, e)
        }
    }

    view = ( view_name,data ) =>
    {
        try
        {
            if(!data)  data = {}
            let mustache = require('mustache')
            let fs = require('fs')
            let content = fs.readFileSync(`${VIEW_PATH}/${view_name}.html`, 'utf8');

            mustache.parse(content)
            return  mustache.render( content,data )
        }
        catch ( e )
        {
            console.log(`Can not find view '${view_name}'`, e)
        }
    }

}


export default Loader

