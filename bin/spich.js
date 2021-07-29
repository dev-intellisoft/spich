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
    console.log(``)
}

const source_path = `./node_modules/spich/src/app`

const init = () =>
{
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
}

const create = () =>
{
    if ( !fs.existsSync(`controllers`) )
        init()

    let [,,, params, name] = process.argv

    if ( !name )
    {
        show_help()
    }
    else
    {
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
}

switch ( command )
{
    case `init`:
        init()
    break
    case `create`:
        create()
    break
    default:
        show_help()
    break
}