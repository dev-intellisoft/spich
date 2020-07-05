import dotenv from 'dotenv'
import { spich } from 'spich'
dotenv.config()
global.APP_PATH = ${process.env.PWD}
new spich().run()