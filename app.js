const bcClientId = process.env.CLIENT_ID
const bcApiToken = process.env.BC_API_TOKEN
const storeHash = process.env.STORE_HASH
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const axios = require('axios')
const app = express()
const router = express.Router()

router.use(cors())
router.use(bodyParser.json())
router.use(awsServerlessExpressMiddleware.eventContext())

axios.defaults.headers.common = {
    "X-Auth-Client": bcClientId,
    "X-Auth-Token": bcApiToken,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

router.get('/customer-attributes', (req, res) => {
    const attributesUrl = `https://api.bigcommerce.com/stores/${storeHash}/v3/customers/attributes?limit=250`
    // TODO: Build pagination to support 251+ attributes
    axios.get(attributesUrl)
        .then(attributesRes => {
            if (!req.apiGateway.event.requestContext.authorizer.bcCustomerId)
                throw new Error('No BC Customer ID in the request')
            if (!attributesRes.data.data || !attributesRes.data.meta)
                throw new Error('BC Response did not include both data and meta.')
            res.status(200).json(attributesRes.data)
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({ status: 500, data: { message: 'Error retrieving attributes' } })
        })
})

router.put('/customer-attribute-values', (req, res) => {
    try {
        if (!req.apiGateway.event.requestContext.authorizer.bcCustomerId)
            throw new Error('No BC Customer ID in the request')
        const customerId = parseInt(req.apiGateway.event.requestContext.authorizer.bcCustomerId)
        const url = `https://api.bigcommerce.com/stores/${storeHash}/v3/customers/attribute-values`
        const reqValues = req.body
        const newValues = reqValues.map(value => {
            value.customer_id = customerId
            return value
        })
        console.log(newValues)
        axios.put(url, newValues)
            .then(attributeValuesRes => {
                if (!attributeValuesRes.data.data || !attributeValuesRes.data.meta) {
                    console.log(attributeValuesRes)
                    throw new Error('BC attributeValuesResponse did not include both data and meta.')
                }
                console.log(attributeValuesRes.data)
                res.status(200).json(attributeValuesRes.data)
            })
            .catch(err => {
                console.error(err)
                res.status(500).json({ status: 500, data: { message: 'Error updating attributes' } })
            })
    } catch (err) {
        console.error(err)
        res.status(400).json({ status: 400, data: { message: 'Bad request' } })
    }
})

app.use('/', router)

module.exports = app