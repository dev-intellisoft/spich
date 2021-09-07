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
            name: `mysql0`,
            driver:`mysql`,
            host:`localhost`,
            user:`test`,
            password:`test`,
            database:`test`,
            port:3306
        }
    ],
    server_port:8081,
    /**
     * authentication: {
     *    database:`sqlite0`,
     * }
     */
    authentication: {
        database:`mysql0`,
    }
}