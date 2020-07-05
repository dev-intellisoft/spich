#!/usr/bin/env node

// import glob from 'glob'
import fs from 'fs'
// import cliProgress from 'cli-progress'

const command = process.argv[2] || ``

switch ( command )
{
    case `init`:
    {
        const index = fs.readFileSync(`./node_modules/spich/src/app/index.js`).toString()
        const view = fs.readFileSync(`./node_modules/spich/src/app/views/index.html`).toString()
        const controller = fs.readFileSync(`./node_modules/spich/src/app/controllers/index.js`).toString()

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

        fs.writeFileSync(`index.js`, index)
        fs.writeFileSync(`controllers/index.js`, controller)
        fs.writeFileSync(`views/index.html`, view)
    }
    break
    default:
    {
        console.log(``)
        console.log(`SPICH USAGE:`)
        console.log(`   init - create a blank spich project`)
        console.log(``)
    }
        break
}