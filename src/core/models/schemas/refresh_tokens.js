export const schema = () => (
{
    refresh_token: { type: String, required: false },
    app_name: { type: String, required: false },
    user_id: { type: String, required: false },
    expires: { type: Date, required: false },
})
