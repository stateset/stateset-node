const rp = require('request-promise');
const qs = require('qs');

function Stateset(apiKey, nodeName) {
    this.apiKey = apiKey;
    this.nodeName = nodeName;
    this.baseUri = `https://${nodeName}.stateset.app/rest/v1`;
}

// Account methods
Stateset.prototype.accounts.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/accounts`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.accounts.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/accounts/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.accounts.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/accounts/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.accounts.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/accounts`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// Address methods
Stateset.prototype.addresses.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/addresses`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.addresses.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/addresses/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.addresses.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/addresses/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// Agreement methods
Stateset.prototype.agreements.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/agreements`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.agreements.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/agreements/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.agreements.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/agreements/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.agreements.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/agreements`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.agreementItems.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/agreement_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.agreementItems.retrieve= function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/agreement_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.agreementItems.update = function (id, params) {
    const options = {

        method: 'PUT',
        uri: `${this.baseUri}/agreement_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.agreementItems.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/agreement_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },


    };
    return rp(options);
};


// Approval methods
Stateset.prototype.approvals.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/approvals`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.approvals.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/approvals/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.approvals.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/approvals/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.approvals.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/approvals`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// Case methods
Stateset.prototype.billofmaterials.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/billofmaterials`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.billofmaterials.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/billofmaterials/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.billofmaterials.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/billofmaterials/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.billofmaterials.del = function (id, params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/billofmaterials/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.billofmaterialItems.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/bill_of_material_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// ManufactureOrder methods
Stateset.prototype.billofmaterialItems.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/bill_of_material_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// ManufactureOrder methods
Stateset.prototype.billofmaterialItems.update = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/bill_of_material_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


Stateset.prototype.billofmaterialItems.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/bill_of_material_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.manufactureorderItems.del = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/bill_of_material_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.cases.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/cases/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.cases.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/cases/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.cases.escalate = function (id, params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/cases/${id}/escalate`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.cases.close = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/cases/${id}/close`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.cases.resolve = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/cases/${id}/resolve`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.cases.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/cases`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


// Contact methods
Stateset.prototype.contacts.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/contacts`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.contacts.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/contacts/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.contacts.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/contacts/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.contacts.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/contacts`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


// Customer methods
Stateset.prototype.customers.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/customers`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.customers.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/customers/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.customers.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/customers/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.customers.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/customers`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// InventoryItem methods
Stateset.prototype.inventoryItems.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/inventory_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.inventoryItems.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/inventory_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.inventoryItems.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/inventory_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.inventoryItems.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/inventory_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


// Invoice methods
Stateset.prototype.invoices.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/invoices`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.invoices.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/invoices/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.invoices.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/invoices/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.invoices.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/invoices`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// Invoice methods
Stateset.prototype.invoices.factor = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/invoices/${id}/factor`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// Invoice methods
Stateset.prototype.invoices.pay = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/invoices/${id}/pay`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// Lead methods
Stateset.prototype.leads.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/leads`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.leads.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/leads/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.leads.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/leads/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.leads.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/leads`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// ManufactureOrder methods
Stateset.prototype.manufactureorders.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/manufacture_orders`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.manufactureorders.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/manufacture_orders/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.manufactureorders.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/manufacture_orders/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.manufactureorders.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/manufacture_orders`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// ManufactureOrder methods
Stateset.prototype.manufactureorderItems.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/manufacture_order_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// ManufactureOrder methods
Stateset.prototype.manufactureorderItems.update = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/manufacture_order_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


Stateset.prototype.manufactureorderItems.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/manufacture_order_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

// ManufactureOrder methods
Stateset.prototype.manufactureorderItems.del = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/manufacture_order_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


// Message methods
Stateset.prototype.messages.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/messages`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.messages.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/messages/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.messages.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/messages/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.messages.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/messages`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


// Order methods
Stateset.prototype.orders.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/orders`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.orders.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/orders/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.orders.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/orders/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.orders.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/orders`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


// OrderLineItem methods
Stateset.prototype.orderItems.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/order_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.orderItems.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/order_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.orderItems.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/order_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.orderItems.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/order_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// Payment methods
Stateset.prototype.packingLists.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/packingLists`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// Payment methods
Stateset.prototype.packingLists.retrieve = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/packingLists`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.packingLists.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/payments/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// ProposalLineItem methods
Stateset.prototype.packingListItems.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/packingListItems`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.packingListItems.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/packingListItems/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};


Stateset.prototype.packingListItems.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/packingListItems/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


// Payment methods
Stateset.prototype.payments.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/payments`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.payments.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/payments/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.payments.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/payments/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.payments.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/payments`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


// Pick methods
Stateset.prototype.picks.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/picks`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.picks.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/picks/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.picks.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/picks/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.picks.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/picks`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


// Proposal methods
Stateset.prototype.proposals.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/proposals`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.proposals.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/proposals/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.proposals.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/proposals/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.proposals.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/proposals`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


// ProposalLineItem methods
Stateset.prototype.proposalItems.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/proposal_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.proposalItems.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/proposal_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.proposalItems.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/proposal_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.proposalItems.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/proposal_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


// PurchaseOrder methods
Stateset.prototype.purchaseorders.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/purchase_orders`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.purchaseorders.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/purchase_orders/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.purchaseorders.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/purchase_orders/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.purchaseorders.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/purchase_orders`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


// PurchaseOrderLineItem methods
Stateset.prototype.purchaseOrderItems.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/purchase_order_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.purchaseOrderItemss.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/purchase_order_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.purchaseOrderItems.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/purchase_order_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.purchaseOrderItems.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/purchase_order_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


// Return Methods

Stateset.prototype.returns.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/returns`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,

        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.returns.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/returns/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.returns.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/returns/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.returns.list = function (params) {

    const options = {
        method: 'GET',
        uri: `${this.baseUri}/returns`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },

        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// ReturnLineItem methods

Stateset.prototype.returnItems.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/return_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.returnItems.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/return_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.returnItems.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/return_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.returnItems.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/return_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);

};


Stateset.prototype.shipments.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/shipments`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.shipments.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/shipments/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.shipments.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/shipments/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.shipments.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/shipments`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.shipmentItems.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/shipment_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.shipmentItems.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/shipment_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.shipmentItems.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/shipment_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.shipmentItems.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/shipment_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,

        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};



Stateset.prototype.warehouses.create = function (params) {

    const options = {
        method: 'POST',
        uri: `${this.baseUri}/warehouses`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.warehouses.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/warehouses/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };

    return rp(options);
};

Stateset.prototype.warehouses.update = function (id, params) {


    const options = {

        method: 'PUT',
        uri: `${this.baseUri}/warehouses/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };

    return rp(options);
};

Stateset.prototype.warehouses.list = function (params) {

    const options = {
        method: 'GET',
        uri: `${this.baseUri}/warehouses`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


Stateset.prototypes.warranties.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/warranties`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {

            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.warranties.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/warranties/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.warranties.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/warranties/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.warranties.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/warranties`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.warrantyItems.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/warranty_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.warrantyItems.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/warranty_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.warrantyItems.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/warranty_line_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.warrantyItems.list = function (params) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/warranty_line_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        qs: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototypes.workorders.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/workorders`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {

            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

Stateset.prototype.workorders.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/workorders/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

Stateset.prototype.workorders.update = function (id, params) {
    const options = {
        method: 'PUT',
        uri: `${this.baseUri}/workorders/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// ManufactureOrder methods
Stateset.prototype.workorderItems.create = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/work_order_items`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

// ManufactureOrder methods
Stateset.prototype.workorderItems.update = function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/work_order_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};


Stateset.prototype.workorderItems.retrieve = function (id) {
    const options = {
        method: 'GET',
        uri: `${this.baseUri}/work_order_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        json: true,
    };
    return rp(options);
};

// ManufactureOrder methods
Stateset.prototype.workorderItems.delete= function (params) {
    const options = {
        method: 'POST',
        uri: `${this.baseUri}/work_order_items/${id}`,
        headers: {
            Authorization: `Bearer ${this.apiKey}`,
        },
        form: params,
        json: true,
        qsStringifyOptions: {
            arrayFormat: 'brackets',
            encode: false,
        },
    };
    return rp(options);
};

module.exports = function (apiKey) {
    return new Stateset(apiKey);
};