# BigCommerce Current Customer JWT API Gateway Authorizer

Use `npm run build` to create a [lambda deployment package](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-package.html) for a custom [AWS Serverless Express](https://github.com/awslabs/aws-serverless-express) Lambda for use with an [API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) configured to use the [BigCommerce Current Customer JWT API Gateway Authorizer](https://github.com/hatertron3000/bigcommerce-current-customer-jwt-api-gateway-authorizer).

Configure the following environment variables to in Lambda console or with AWS CLI:

|   Variable   |                                     Value                                     |
|:------------:|:-----------------------------------------------------------------------------:|
| BC_API_TOKEN | The BigCommerce API token supplied with your API credentials.                 |
| CLIENT_ID    | The BigCommerce client ID supplied with your API credentials.                 |
| STORE_HASH   | The BigCommerce store hash for the store that generated your API credentials. |

This Lambda is responsible for...
* ...querying the [BigCommerce Get All Customer Attributes API](https://developer.bigcommerce.com/api-reference/store-management/customers-v3/customer-attributes/customersattributesget) for the store identified by the STORE_HASH environment variable,
* ...querying the [BigCommerce Get All Customer Attributes API](https://developer.bigcommerce.com/api-reference/store-management/customers-v3/customer-attribute-values/customersattributevaluesget) for the same store filtered by the customer ID supplied by the [BigCommerce Current Customer JWT API Gateway Authorizer](https://github.com/hatertron3000/bigcommerce-current-customer-jwt-api-gateway-authorizer),
* ...and returning an array of combined attribute and attribute value data for the given customer.