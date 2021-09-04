import * as assert from "assert";
import axios from 'axios'
axios.defaults.baseURL = `http://localhost:8080`
axios.defaults.headers.common['Content-Type'] = 'application/json'


describe('SQLITE OAUTH2', async () =>
{
    it (`should not be able to access private area`, async () =>
    {
        try
        {
            const { data } = await axios.get(`/`)
            console.log(data)
        }
        catch (e)
        {
            assert.equal(e.response.data.name, `unauthorized_request`)
        }
    })

    // it (`should create a user`, async () =>
    // {
    //     const { data } = await axios.post(`/users/create`, {
    //         username:`José`,
    //     })
    //
    //     console.log(data)
    // })
})