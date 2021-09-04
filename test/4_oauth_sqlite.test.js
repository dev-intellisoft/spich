import * as assert from "assert";
import axios from 'axios'


describe('SQLITE OAUTH2', async () =>
{
    before(async () =>
    {
        axios.defaults.baseURL = `http://localhost:8080`
        axios.defaults.headers.common['Content-Type'] = 'application/json'

        await axios.delete(`/users`)
    })

    it (`should not be able to access private area`, async () =>
    {
        try
        {
            await axios.get(`/`)
        }
        catch (e)
        {
            assert.equal(e.response.data.name, `unauthorized_request`)
        }
    })

    it (`should create a user`, async () =>
    {
        const { data } = await axios.post(`/users`, {
            username:`José`,
            email:`jose@test.com`,
            password:`12345678`
        })

        assert.equal(data.changes, 1)
    })

    it(`should not be able to create duplicate user`, async () =>
    {
        const { data } = await axios.post(`/users`, {
            username:`José`,
            email:`jose@test.com`,
            password:`12345678`
        })
        assert.equal(data.code, `SQLITE_CONSTRAINT`)
    })
})