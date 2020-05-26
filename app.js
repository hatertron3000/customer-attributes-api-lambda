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
            console.log(attributesRes)
            if (!req.apiGateway.event.requestContext.authorizer.bcCustomerId)
                throw new Error('No BC Customer ID in the request')
            if (!attributesRes.data.data || !attributesRes.data.meta)
                throw new Error('BC Response did not include both data and meta.')

            const customerId = req.apiGateway.event.requestContext.authorizer.bcCustomerId
            const attributeValuesUrl = `https://api.bigcommerce.com/stores/${storeHash}/v3/customers/attribute-values?customer_id:in=${customerId}&limit=250`
            axios.get(attributeValuesUrl)
                .then(attributeValuesRes => {
                    const resBody = {
                        status: 200,
                        data: attributesRes.data.map(attribute => {
                            const { name, type } = attribute
                            const value = attributeValuesRes.data.find(attrValue => attrValue.attribute_id === attribute.id)
                            const { attribute_value, date_modified, date_created } = value
                            return {
                                attribute_id: attribute.id,
                                name,
                                type,
                                attribute_value,
                                date_created,
                                date_modified,
                            }
                        })
                    }
                    res.status(200).json(resBody)
                })
                .catch(err => {
                    console.error(err)
                    res.status(500).json({ status: 500, data: { message: 'Error retrieving attribute values' } })
                })
            // res.status(200).json(bcRes)
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({ status: 500, data: { message: 'Error retrieving attributes' } })
        })
})

app.use('/', router)

module.exports = app