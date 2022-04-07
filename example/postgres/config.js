export const config = {
    /**
     * Database settings
     * databases:[
     * {
     *       name: `my connection`,
     *       driver:<postgres | mysql | sqlite>,
     *       host:`localhost`,
     *       user:`test`,
     *       password:`test`,
     *       database:`test`,
     *       port:123
     *   }
     * ],
     */
    databases:[
        {
            name: `postgres0`,
            driver:`postgres`,
            host:`localhost`,
            user:`test`,
            password:`test`,
            database:`test`,
            port:5432
        }
    ],
    server_port:8082,
    /**
     * authentication: {
     *    database:`sqlite0`,
     * }
     */
    authentication: {
        database:`postgres0`,
    }
}
