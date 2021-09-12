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
            name:`sqlite0`,
            file:`test.db`,
            driver:`sqlite`
        }
    ],
    server_port:8083,
    /**
     * authentication: {
     *    database:`sqlite0`,
     * }
     */
    authentication: {
        database:`sqlite0`,
    }
}