import assert from 'assert'
import axios from 'axios'

axios.defaults.baseURL = `http://localhost`
axios.defaults.headers.common['Content-Type'] = 'application/json'


describe('controller', async () =>
{
    it(`should access the default function from default controller`, async () =>
    {
        /**
         *  The default controller index and the default function is index.
         *  It's like the user is accessing /index/index
         */
        const { data } = await axios.get(`/`)
        assert.equal(data, `OK`)
    })

    it (`should return the content of index function from foo controller`, async () =>
    {
        /**
         *  this should load the controller 'foo' and returns the content of function index
         */
        const { data } = await axios.get(`/foo`)
        assert.equal(data, `foo`)
    })

    const str = `bar`

    it (`should pass the '${str}' to index function foo controller`, async () =>
    {
        const { data } = await axios.get(`/foo/${str}`)
        assert.equal(data, str)
    })

    it (`should test all http methods`, async () =>
    {
        let res
        res = await axios.get(`/test/methods`)
        assert.equal(res.data, `GET`)
        res = await axios.post(`/test/methods`, {})
        assert.equal(res.data, `POST`)
        res = await axios.put(`/test/methods`, {})
        assert.equal(res.data, `PUT`)
        res = await axios.patch(`/test/methods`, {})
        assert.equal(res.data, `PATCH`)
        res = await axios.delete(`/test/methods`)
        assert.equal(res.data, `DELETE`)
    })

    it(`should test http post method`, async () =>
    {
        const foo = `bar`
        const { data } = await axios.post(`/test/returns/foo`, { foo })
        assert.equal(data, foo)
    })

    it(`should test http put method`, async () =>
    {
        const foo = `bar`
        const { data } = await axios.put(`/test/returns/foo`, { foo })
        assert.equal(data, foo)
    })

    it (`should test http patch method`, async () =>
    {
        const foo = `bar`
        const { data } = await axios.patch(`/test/returns/foo`, { foo })
        assert.equal(data, foo)
    })

    it (`should test lib implementation`, async () =>
    {
        /**
         * Test lib  should load the lib and call a function passing a parameter and it should send back to me
         */
        const { data } = await axios.get(`/test/libs/hello`)
        assert.equal(data, `hello`)
    })

    it (`should test model implementation`, async () =>
    {
        /**
         * Test lib  should load the model and call a function passing a parameter and it should send back to me
         */
        const { data } = await axios.get(`/test/models/hello`)
        assert.equal(data, `hello`)
    })

    // it(`should call a controller inside a folder`, async () =>
    // {
    //     //todo fix this issue later
    //     const { data } = await axios.get(`/myfolder/blah`)
    //     console.log(data)
    // })

    // it(`should should understand the '${str}' string as argument`, async () =>
    // {
    //     /**
    //      * If not found 'bar' controller spich will understand 'bar' string
    //      * as an parameter to function 'index' of index controller
    //      */
    //     //todo fix this issue later
    //     //
    //     // const { data } = await axios.get(`/foo`)
    //     // assert.equal(data, str)
    // })

    // it (`should test lib implementation`, async () =>
    // {
    //     //todo fix this bug
    //     // const { data } = await axios.get(`/test/lib/hello`)
    //     // console.log(data)
    // })

    // it (`should test model implementation`, async () =>
    // {
    //     //todo fix this bug
    //     // const { data } = await axios.get(`/test/model/hello`)
    //     // assert.equal(data, `hello`)
    // })
})