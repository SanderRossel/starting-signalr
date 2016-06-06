$(function () {
    // Helper function for Knockout to get the new and old value on change...
    // https://github.com/knockout/knockout/pull/320
    ko.subscribable.fn.subscribeChanged = function (callback) {
        var previousValue;
        this.subscribe(function (_previousValue) {
            previousValue = _previousValue;
        }, undefined, 'beforeChange');
        this.subscribe(function (latestValue) {
            callback(latestValue, previousValue);
        });
    };

    var toJSProduct = function (p) {
        return {
            id: p.Id,
            name: p.Name,
            amount: ko.observable(p.Amount)
        };
    };

    // The list of products we'll be binding to.
    var stock = ko.observableArray([]);
    var department = ko.observable();

    // Create a connection to the SignalR hub.
    var stockHub = $.connection.stockHubWithDepartments;

    department.subscribeChanged(function (newDepartment, oldDepartment) {
        if (oldDepartment) {
            stockHub.server.leaveDepartment(oldDepartment);
        }
        if (newDepartment) {
            stockHub.server.joinDepartment(newDepartment);
        }
    });

    // Whenever an item is added to the array...
    stock.subscribe(function (products) {
        products.forEach(function (product) {
            // Make sure to get a notification if the amount of that item changes.
            product.amount.subscribe(function (newValue) {
                // Send the update to the server.
                stockHub.server.updateAmount(department(), product.id, newValue);
            });
        });
    });

    // Define a function on the hub.client, this can be called from the server.    
    stockHub.client.updateAmount = function (id, amount) {
        var product = stock().filter(function (p) { return p.id === id })[0];
        if (product) {
            product.amount(amount);
        }
    };

    stockHub.client.getStock = function (products) {
        stock.push.apply(stock, products.map(toJSProduct));
    };

    // Connect to the SignalR hub.
    // Once this is done we'll be able to send and receive messages.
    $.connection.hub.start().done(function () {
        department('sales');
        stockHub.server.getStock();
    });

    ko.applyBindings({
        stock: stock,
        department: department,
        increment: function (product) {
            product.amount(product.amount() + 1);
        },
        decrement: function (product) {
            product.amount(product.amount() - 1);
        }
    });
});