# Stateset Node.js Library

The Stateset Node library provides convenient access to the Stateset API from applications written in server-side JavaScript.

## Installation

Install the package with:

```sh
npm install stateset-node --save
# or
yarn add stateset-node
```

## Usage
The package needs to be configured with your account's secret key, which is available in the Stateset Dashboard. Require it with the key's value:


```
const stateset = require('stateset')('sk_test_...');

stateset.customers.create({
  email: 'customer@example.com',
})
  .then(stateset => console.log(stateset.id))
  .catch(error => console.error(error));

```

### Returns Example

```javascript

// Define the parameters for the new return
const returnParams = {
  order_id: '123456',
  items: [
    { sku: 'SKU-123', qty: 2 },
    { sku: 'SKU-456', qty: 1 },
  ],
  reason: 'Defective',
  note: 'This product was damaged during shipping.',
};

// Call the "create" method with the parameters
stateset.returns.create(returnParams)
  .then((response) => {
    console.log(response);
    // Do something with the response, like show a success message
  })
  .catch((error) => {
    console.error(error);
    // Handle the error, like showing an error message to the user
  });

  // Retrieve a return by its ID
stateset.returns.retrieve('return-123')
  .then((response) => {
    console.log(response);
    // Do something with the retrieved return, like show its details to the user
  })
  .catch((error) => {
    console.error(error);
    // Handle the error, like showing an error message to the user
  });

// Update an existing return with new parameters
const updatedParams = {
  reason: 'Changed my mind',
  note: 'I no longer want this product.',
};
stateset.returns.update('return-123', updatedParams)
  .then((response) => {
    console.log(response);
    // Do something with the updated return, like show a success message
  })
  .catch((error) => {
    console.error(error);
    // Handle the error, like showing an error message to the user
  });

  ```


