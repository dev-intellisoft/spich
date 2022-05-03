import assert from 'assert'
import axios from 'axios'
import randomstring from 'randomstring'

axios.defaults.baseURL = `http://localhost`
axios.defaults.headers.common['Content-Type'] = 'application/json'

const table = randomstring.generate({ charset:`alphabetic` })
const field = randomstring.generate({ charset:`alphabetic` })
const value = randomstring.generate({ charset:`alphabetic` })

describe('sqlite', async () =>
{
    it(`should create a sqlite table`, async () =>
    {
        const { data } = await axios.patch(`/sqlite/${table}/${field}`)
        assert.ok(data.lastID === 0 )
    })

    it(`should insert a value in the table`, async () =>
    {
        const { data } = await axios.post(`/sqlite/${table}/${field}`, { value })
        assert.ok(data.changes === 1)
    })

    it(`should select the previous insert values from the table`, async () =>
    {
        const { data:[ row ] } = await axios.get(`/sqlite/${table}/${field}`)
        assert.equal(row[field], value)
    })

    it(`should update the previous inserted value to new one`, async () =>
    {
        const value = `new value`
        const { data } = await axios.put(`/sqlite/${table}/${field}`, { value })
        assert.ok(data.changes > 0)
    })

    it(`should delete all rows from table`, async () =>
    {
        const { data } = await axios.delete(`/sqlite/${table}`)
        assert.ok(data.changes > 0)
    })

    it(`should drop the table`, async () =>
    {
        await axios.head(`/sqlite/${table}`)
        const { data } = await axios.get(`/sqlite/${table}/${field}`)
        assert.ok(data.errno > 0)
    })
})
