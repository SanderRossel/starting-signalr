$(function () {
    var toJSProduct = function (p) {
        return {
            id: p.Id,
            name: p.Name,
            amount: ko.observable(p.Amount)
        };
    };

    // The list of products we'll be binding to.
    var stock = ko.observableArray([]);

    // Create a connection to the SignalR hub.
    var stockHub = $.connection.stockHub;

    // Whenever an item is added to the array...
    stock.subscribe(function (products) {
        products.forEach(function (product) {
            // Make sure to get a notification if the amount of that item changes.
            product.amount.subscribe(function (newValue) {
                // Send the update to the server.
                stockHub.server.updateAmount(product.id, newValue);
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
        stockHub.server.getStock();
    });

    ko.applyBindings({
        stock: stock,
        increment: function (product) {
            product.amount(product.amount() + 1);
        },
        decrement: function (product) {
            product.amount(product.amount() - 1);
        }
    });
});