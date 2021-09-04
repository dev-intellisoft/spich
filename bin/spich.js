#!/usr/bin/env node

/**
 * todo make spich create c myfolder/mycontroller work
 * todo make spich create l myfolder/mymodel work
 * todo make spich create m myfolder/mylib work
 *
 * todo later add "spich create:controller <controller>" command
 * todo later add "spich create:model <model>" command
 * todo later add "spich create:library <library>" command
 */

import fs from 'fs'
import read from 'read'
import Database from './oauth/database.js'

global.APP_PATH = `${process.env.PWD}`

const command = process.argv[2] || ``

const show_help = () =>
{
    console.log(``)
    console.log(`SPICH USAGE:`)
    console.log(`   init - create a blank spich project`)
    console.log(`   create [mvcl] < file_name > - create basic scaffolding file structure`)
    console.log(`       m -> for model`)
    console.log(`       v -> for view`)
    console.log(`       c -> for controller`)
    console.log(`       l -> for library`)
    console.log(`   enable auth --db [db_name]`)
}

const source_path = `./node_modules/spich/src/app`

const init = () =>
{
    const config = fs.readFileSync(`${source_path}/config.js`).toString()
    const index = fs.readFileSync(`${source_path}/index.js`).toString()
    const view = fs.readFileSync(`${source_path}/views/index.html`).toString()
    let controller = fs.readFileSync(`${source_path}/controllers/index.js`).toString()

    controller = controller.replace(/{{controller}}/g, `Index`)
    controller = controller.replace(/{{view}}/g, `index`)
    controller = controller.replace(/{{loaders}}/g, ``)

    if ( !fs.existsSync(`controllers`) )
        fs.mkdirSync(`controllers`)

    if ( !fs.existsSync(`models`) )
        fs.mkdirSync(`models`)

    if ( !fs.existsSync(`libs`) )
        fs.mkdirSync(`libs`)

    if ( !fs.existsSync(`views`) )
        fs.mkdirSync(`views`)

    if ( !fs.existsSync(`storage`) )
        fs.mkdirSync(`storage`)

    if ( !fs.existsSync(`index.js`) )
        fs.writeFileSync(`index.js`, index)

    if ( !fs.existsSync(`controllers/index.js`) )
        fs.writeFileSync(`controllers/index.js`, controller)

    if ( !fs.existsSync(`views/index.html`) )
        fs.writeFileSync(`views/index.html`, view)

    fs.writeFileSync(`config.js`, config)
}

const create = () =>
{
    if ( !fs.existsSync(`controllers`) )
        init()

    let [,,, params, name] = process.argv

    if ( !name )
        return show_help()


    name = name.toLowerCase().trim().charAt(0).toUpperCase() + name.slice(1)
    let loaders = ``
    if ( params.includes(`m`) )
    {
        let model = fs.readFileSync(`${source_path}/models/index.js`).toString()
        model = model.replace(/{{model}}/g, `${name}_Model`)
        if ( !fs.existsSync(`models/${name.toLowerCase()}_model.js`) )
            fs.writeFileSync(`models/${name.toLowerCase()}_model.js`, model)
        loaders = `${loaders} await this.model(\`${name}\`)\n`
    }

    if ( params.includes(`l`) )
    {
        let lib = fs.readFileSync(`${source_path}/libs/index.js`).toString()
        lib = lib.replace(/{{lib}}/g, `${name}_Lib`)
        if ( !fs.existsSync(`libs/${name.toLowerCase()}_lib.js`) )
            fs.writeFileSync(`libs/${name.toLowerCase()}_lib.js`, lib)
        loaders = `${loaders} await this.lib(\`${name}\`)\n`
    }

    if ( params.includes(`v`) )
    {
        const view = fs.readFileSync(`${source_path}/views/index.html`).toString()
        if ( !fs.existsSync(`views/${name.toLowerCase()}.html`) )
            fs.writeFileSync(`views/${name.toLowerCase()}.html`, view)
    }

    if ( params.includes(`c`) )
    {
        let controller = fs.readFileSync(`${source_path}/controllers/index.js`).toString()
        controller = controller.replace(/{{controller}}/g, name)
        controller = controller.replace(/{{view}}/g, name.toLowerCase())
        controller = controller.replace(/{{loaders}}/g, loaders)
        if ( !fs.existsSync(`controllers/${name.toLowerCase()}.js`) )
            fs.writeFileSync(`controllers/${name.toLowerCase()}.js`,  controller)
    }
}

const enable = async () =>
{
    const [ ,,, mod, db, db_name ] = process.argv

    if ( mod !== `auth` || db !== `--db` )
        return show_help()

    const { config } = await import(`../example/public/config.js`)
    if ( config.authentication !== undefined )
    {
        const [ database ] = config.databases.filter(({ name }) => db_name === name)
        if ( !database )
            return console.log(`No database configuration for "${db_name}" \n Please include int in "config.js"`)

        read({ prompt: 'Type your application application: ' }, async ( er, applications ) =>
        {
            read({ prompt: 'Password: ', silent: true }, async ( er, password ) =>
            {
                const db = new Database(database)
                await db.init()
                await db.insert_application(applications, password)

                console.log(`You credentials are : applications=${applications}; password=${password}` )
            })
        })
    }
    else
    {
        console.log(`You need to setup auth settings in config.js`)
        console.log(`Eg.: \n... \n authentication: { \n  enable:false,\n  database:\`sqlite0\`, \n} \n...`)
    }
}

switch ( command )
{
    case `init`:
        init()
    break
    case `create`:
        create()
    break
    case `enable`:
        enable()
    break
    default:
        show_help()
    break
}