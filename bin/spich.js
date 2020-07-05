#!/usr/bin/env node

// import glob from 'glob'
import fs from 'fs'
// import cliProgress from 'cli-progress'

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

    controller = controller.replace(/{{controller}}/g, `index`)
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

    const params = process.argv[3]

    let name = process.argv[4]

    if ( !name )
    {
        show_help()
    }
    else
    {
        name = name.toLowerCase().trim()
        let loaders = ``
        if ( params.includes(`m`) )
        {
            let model = fs.readFileSync(`${source_path}/models/index.js`).toString()
            model = model.replace(/{{model}}/g, name)
            if ( !fs.existsSync(`models/${name}_model.js`) )
                fs.writeFileSync(`models/${name}_model.js`, model)
            loaders = `${loaders} await this.model(\`${name}\`)\n`
        }

        if ( params.includes(`l`) )
        {
            let lib = fs.readFileSync(`${source_path}/libs/index.js`).toString()
            lib = lib.replace(/{{lib}}/g, name)
            if ( !fs.existsSync(`libs/${name}_lib.js`) )
                fs.writeFileSync(`libs/${name}_lib.js`, lib)
            loaders = `${loaders} await this.lib(\`${name}\`)\n`
        }

        if ( params.includes(`v`) )
        {
            const view = fs.readFileSync(`${source_path}/views/index.html`).toString()
            if ( !fs.existsSync(`views/${name}.html`) )
                fs.writeFileSync(`views/${name}.html`, view)
        }

        if ( params.includes(`c`) )
        {
            let controller = fs.readFileSync(`${source_path}/controllers/index.js`).toString()
            controller = controller.replace(/{{controller}}/g, name)
            controller = controller.replace(/{{view}}/g, name)
            controller = controller.replace(/{{loaders}}/g, loaders)
            if ( !fs.existsSync(`controllers/${name}.js`) )
                fs.writeFileSync(`controllers/${name}.js`,  controller)
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