#GETTING STARTED

# OPP Framework
---

1. DIRECTORY STRUCTURE

OPP Frame Work was made to solve code organization, keeping the code in MVC principles.


Folder Structures.

````
.
+-- core                (dedicated for core files)
+-- app                 (where your applications will reside)
|   +-- controllers     (entry point for your application)
|   +-- models          (classes the access retrieve information from database)
|   +-- views           (visual part of code must reside here)
|   +-- libraries       (classes retrieve outer datasource and/or also shared logic)
|   +-- core            (if you need to overwrite the default core you need to extends and overwrite here)
|   +-- locales         (dedicated for translations of the system)
|   +-- migrations      (dedicated to share database files)
|   +-- static
|   |   +-- assets
|   |       +-- images
|   +-- storage
|   |    +-- cache
|   |    +-- data
|   |    +-- uploads
+-- logs                (query, request, databases, error logs)


````
2. First step

Since you start the server the process will listen on port 80 or 443 if you enable ssl in your .env file. It is also possible to determine in your .env file another port to be listened.

2.1 Soon as you have your server running, it will be possible to make request to server accessing the end point followed by the resource you want.

By the default will
```
/<controller>/<method>
```




3.0 CONTROLLERS

Controllers will be always the entry point of flow to create a controller simply create a javascript class in the controllers directory like bellow:
````javascript
class Test
{
    // your code here...
}

export  default  Test
````
3.1 REGISTERS

Once you have created you first controller you need register it into the application.
You can to that by import you controller class to `register.js` file, like bellow:

````javascript
import  Test from './app/controllers/test'


export default
{
    'test':Test
}
````
In this point will be possible to make the follow resquest to server

````curl
/test
````
as no function was passed the server will return the follow error:
````json
{
    "code": 100,
    "message": "No function 'index' found in controller 'test'!"
}
````
if no function was informed the framework will assume `index` as function, to solve this you can simply create the follow function in your recent created controller class:
````javascript
class Test
{
    async index()
    {
        return 'Hello World!'
    }
}

export  default  Test
````
To call a specific function in my controller you can simple:

````curl
/test/my_function
````
````javascript
class Test
{
    async my_function()
    {
        //your code here!
    }
}

export  default  Test
````

4.0 ROUTERS

The intention of routers will be shift the program flow from default controller to another controller.

How it works?

You can edit the file `app/.conf/routers.json`.

If this files not exits  you can create it.
````json
{
  "/<route controller>[/<route function>]":"/<target controller>[/<targer function>/<arg1>/...]"
}
````
Example:

````javascript
//app/controllers/controllera.js
class ControllerA
{
    async index()
    {
        return 'I am in Controller A'
    }
}
export default ControllerA
````
````javascript
//app/controllers/controllerb.js
class ControllerB
{
    async index()
    {
        return 'I am in Controller B'
    }
}
export default ControllerB
````
````json
{
  "/controllera":"/controllerb"
}
````

as result we will get the follow output string:

 `"I am in Controller B"`

5.0 REQUESTS

To work filtering request methods will be necessary `import` and `extends`
the class `Controller` from `core/controller`
````javascript
import Controller from '../../core/controller'

class Test extends Controller
{
    async index()
    {
        //if request method is a get
        if(this.is_get())
        {
            return 'This is a GET request!'
        }

        //if request method is a post
        if(this.is_post())
        {
            return 'This is a POST request!'
        }

        //OPTION, HEAD and so on...

    }
}

export  default  Test
````

Since the request is `GET` request:
````curl
GET /test/index
````
We'll get as result the output string:

`This is a GET request!`

If it was a `POST`

the result will be:

`This is a POST request!`

6.0 LIBRARIES

Libraries was designed to:

* Computer common logic.
* Place complex logic, (let the controllers more clean and easy to matain).
* Access data from data sources outer system.


6.1 STRUCTURE OF LIBRARY CLASS
Every library class must reside in the folder `app/libraries` and must be suffixed as `<library_name>_lib`
Example:

````javascript
class Test_Lib
{
    say_hello(name)
    {
        return `Hello ${name}!`
    }
}

export default Test_Lib
````

> **NOTE**:
>All libraries as controllers must be registered to be ready for use.

> **NOTE**:
>Use `async` method  only when your data is on external sources.

6.2 LOADER AND USING LIBRARIES

Since you create and register properly your library class, you will be able use it in your controller byr using the method passing as parameter the name of your library without `_lib` `this.library(<library_name>)`


````javascript
import Controller from '../../core/controller'

class Test extends Controller
{
    // dont forget to use the constructor method to inherit the extended class
    constructor()
    {
        super()
    }
    async index()
    {
        this.library('test')
        //once you have load the library an object with you library name will be available in your controller
        this.test_lib.say_hello('Bob')
        // the result should be "Hello Bob!"
    }
}

export  default  Test
````
7.0 MODELS

Models are specials classes dedicated to retrieve data from databases.

7.1 STRUCTURE OF MODEL CLASS

Models must reside in `app/models`   and must be suffixed as `<model_name>_model`

Example:
````javascript
// you must import and extends the model class from core
import Model from '../core/model'

class Test_Model extends Model
{
    constructor()
    {
        super()
    }

    async get_users()
    {
        return await this.query(`<your sql code here>`)
    }
}

export default Test_Model
````
7.2 LOADER AND USING MODELS

Since you created and register properly your model class you will be able to use it in your controller by doing so:



````javascript
import Controller from '../../core/controller'

class Test extends Controller
{
    // dont forget to use the constructor method to inherit the extended class
    constructor()
    {
        super()
    }
    async index()
    {
        this.model('test')
        //once you have load the model an object with your model name will be available in your controller
        let users = await this.test_model.get_users()
        // the result should be "Hello Bob!"
    }
}

export  default  Test
````
>**NOTE**:
>>As a good pratice solve all your SQL names in your models.

>**NOTE**:
>>Before start use model set your `.env` with your database configurations.
>> if no configuration was set the framework will try to resolve "localhost" for `host`; the use started the node process will be take as database use for example `root` blanc will be take as password the port will be `5432`(default postgres port) and blank will be the datasource.





*Credits to: FANTEM WAD TEAM*