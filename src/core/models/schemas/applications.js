export const schema = () => (
{
    app_name: { type: String, required: false },
    app_secret: { type: String, required: false },
    redirect_url: { type: String, required: false },
    description: { type: String, required: false },
    grants: { type:Array, required:true, default:[
        `authorization_code`,
        `client_credentials`,
        `refresh_token`,
        `password`
    ]}
})
