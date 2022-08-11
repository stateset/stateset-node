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