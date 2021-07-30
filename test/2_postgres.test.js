import assert from 'assert'
import axios from 'axios'
import randomstring from 'randomstring'

axios.defaults.baseURL = `http://localhost`
axios.defaults.headers.common['Content-Type'] = 'application/json'

const table = randomstring.generate({ charset:`alphabetic` })
const field = randomstring.generate({ charset:`alphabetic` })
const value = randomstring.generate({ charset:`alphabetic` })

describe('postgres', async () =>
{
    it(`should select the previous insert values from the table`, async () =>
    {
        await axios.patch(`/postgres/${table}/${field}`)
        await axios.post(`/postgres/${table}/${field}`, { value })
        let { data:[res] } = await axios.get(`/postgres/${table}/${field}`)
        assert.equal(res[field.toLowerCase()], value)
    })

    it(`should update the previous inserted value to new one`, async () =>
    {
        const value = `new value`
        await axios.put(`/postgres/${table}/${field}`, { value })
        const { data:[res] } = await axios.get(`/postgres/${table}/${field}`)
        assert.equal(res[field.toLowerCase()], value)
    })

    it(`should delete all rows from table`, async () =>
    {
        await axios.delete(`/postgres/${table}`)
        const { data } = await axios.get(`/postgres/${table}/${field}`)
        assert.ok(data.length === 0)
    })

    it(`should drop the table`, async () =>
    {
        await axios.head(`/postgres/${table}`)
        const { data } = await axios.get(`/postgres/${table}/${field}`)
        assert.equal(data.code, `42P01`)
    })
})