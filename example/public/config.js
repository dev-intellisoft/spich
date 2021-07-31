export const config = {
    databases:[
        {
            name:`sqlite0`,
            file:`test.db`,
            driver:`sqlite`
        },
        {
            name: `postgres0`,
            driver:`postgres`,
            host:`localhost`,
            user:`test`,
            password:`test`,
            database:`test`,
            port:5432
        },
        {
            name: `mysql0`,
            driver:`mysql`,
            host:`localhost`,
            user:`test`,
            password:`test`,
            database:`test`,
            port:3306
        }
    ]
}