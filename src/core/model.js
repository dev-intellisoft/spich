/**
 * Created by wellington on 09/08/2017.
 */


import  Database from './database'

class Model extends Database
{
    constructor(props, name)
    {
        const [ config ] = props.filter((db) => db.name === name)
        super(config)
    }
}

export default  Model
