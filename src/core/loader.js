/**
 * Created by wellington on 26/07/2017.
 */


import loadable from './loadable'
import logger from './logger'
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
            new logger().error(e)
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
            new logger().error(e)
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
            new logger().error(e)
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
            new logger().error(e)
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
            new logger().error(e)
        }
    }

}


export default Loader

