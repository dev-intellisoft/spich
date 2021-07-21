/**
 * Created by wellington on 21/07/2017.
 */


import Loader from './loader'

class Controller extends Loader
{
    constructor()
    {
        super()
        this.load(`input`)
    }

    is_post = () => (request.method === `POST`)

    is_get = () => (request.method === `GET`)

    is_delete = () => (request.method === `DELETE`)

    is_put = () => (request.method === `PUT`)

    is_patch = () => (request.method === `PATCH`)
}

export default Controller
