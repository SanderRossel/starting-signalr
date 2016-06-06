using Microsoft.AspNet.SignalR;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRSite
{
    public class StockHub : Hub
    {
        private static List<Product> stock = new List<Product>
        {
            new Product(1, "Apple", 15),
            new Product(2, "Pear", 10),
            new Product(3, "Pineapple", 5)
        };

        public void GetStock()
        {
            // Sends a message to the caller.
            Clients.Caller.getStock(stock);
        }
        
        public void UpdateAmount(int id, int newAmount)
        {
            Product product = stock.SingleOrDefault(p => p.Id == id);
            if (product != null)
            {
                product.Amount = newAmount;
                // This line calls the updateAmount function in JavaScript.
                Clients.All.updateAmount(id, newAmount);
            }
        }
    }
}