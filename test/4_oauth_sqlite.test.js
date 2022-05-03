import * as assert from "assert";
import axios from 'axios'
import qs from 'qs'
import users  from './users.mjs'


describe('SQLITE OAUTH2', async () =>
{
    before(async () =>
    {
        axios.defaults.baseURL = `http://localhost:8080`
        axios.defaults.headers.common['Content-Type'] = 'application/json'
    })

    after(async () =>
    {
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
        const { data } = await axios.post(`/users`, users.jose)

        assert.equal(data.changes, 1)
    })

    it(`should not be able to create duplicate user`, async () =>
    {
        const { data } = await axios.post(`/users`, users.jose)
        assert.equal(data.code, `SQLITE_CONSTRAINT`)
    })

    it(`user should authenticate`, async () =>
    {
        axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded'
        axios.defaults.headers.common['Authorization'] = 'Basic dGVzdDp0ZXN0'
        const credentials = qs.stringify({
            'username': users.jose.email,
            'password': users.jose.password,
            'grant_type': 'password'
        })
        const {data} = await axios.post(`/oauth/token`, credentials)
        axios.defaults.headers.common['Content-Type'] = 'application/json'
        assert.equal(data.client, `test`)
    })

    describe(`test authenticated endpoint`, async () =>
    {
        let access_token
        let refresh_token
        before(async () =>
        {
            axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded'
            axios.defaults.headers.common['Authorization'] = 'Basic dGVzdDp0ZXN0'
            const credentials = qs.stringify({
                'username': users.jose.email,
                'password': users.jose.password,
                'grant_type': 'password'
            })
            const {data} = await axios.post(`/oauth/token`, credentials)
            axios.defaults.headers.common['Content-Type'] = 'application/json'
            access_token = data.access_token
            refresh_token = data.refresh_token
        })

        it(`should not access private endpoint`, async () =>
        {
            try
            {
                await axios.get(`/`)
            }
            catch (e)
            {
                assert.equal(e.message, `Request failed with status code 400`)
            }
        })

        it(`should access private endpoint`, async () =>
        {
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
            const { data } = await axios.get(`/`)
            assert.equal(data, `OK`)
        })

        it(`should expire access_token`, async () =>
        {
            try
            {
                await axios.get(`/users/revoke/${access_token}`)
                axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
                await axios.get(`/`)
            }
            catch (e)
            {
                assert.equal(e.response.data.name, `invalid_token`)
            }
        })

        it(`should refresh access_token`, async () =>
        {
            axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded'
            axios.defaults.headers.common['Authorization'] = 'Basic dGVzdDp0ZXN0'
            const credentials = qs.stringify({
                'refresh_token': refresh_token,
                'grant_type': 'refresh_token'
            })
            const {data} = await axios.post(`/oauth/token`, credentials)
            assert.ok(data.access_token !== undefined)
        })
    })

})
