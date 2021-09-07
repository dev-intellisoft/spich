import dotenv from 'dotenv'
import { Spich } from 'spich'
dotenv.config()
global.APP_PATH = `${process.env.PWD}`
new Spich().run()