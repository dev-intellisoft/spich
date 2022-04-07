import assert from 'assert'
import axios from 'axios'
import randomstring from 'randomstring'

axios.defaults.baseURL = `http://localhost`
axios.defaults.headers.common['Content-Type'] = 'application/json'

const table = randomstring.generate({ charset:`alphabetic` })
const field = randomstring.generate({ charset:`alphabetic` })
const value = randomstring.generate({ charset:`alphabetic` })

describe('mysql', async () =>
{
    it(`should create a new mysql database`, async () =>
    {
        const { data } = await axios.patch(`/mysql/${table}/${field}`)
        assert.equal(data.fieldCount, 0)
        assert.equal(data.affectedRows, 0)
    })
    it (`should add a new record in the previous created table`, async () =>
    {
        const {data} = await axios.post(`/mysql/${table}/${field}`, { value })
        assert.equal(data.affectedRows, 1)
    })

    it(`should select the previous insert values from the table`, async () =>
    {
        const { data:[ res ] } = await axios.get(`/mysql/${table}/${field}`)
        assert.equal(res[field], value)
    })

    it(`should update the previous inserted value to new one`, async () =>
    {
        const value = `new value`
        const { data } = await axios.put(`/mysql/${table}/${field}`, { value })
        assert.equal(data.affectedRows, 1)
    })

    it(`should delete all rows from table`, async () =>
    {
        const {data} = await axios.delete(`/mysql/${table}`)
        assert.equal(data.affectedRows, 1)
    })

    it(`should drop the table`, async () =>
    {
        await axios.head(`/mysql/${table}`)
    })
})
