using Microsoft.AspNet.SignalR;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRSite
{
    public class StockHubWithDepartments : Hub
    {
        private static List<Product> stock = new List<Product>
        {
            new Product(1, "Apple", 15),
            new Product(2, "Pear", 10),
            new Product(3, "Pineapple", 5)
        };

        public void GetStock()
        {
            // Stuurt een bericht naar de caller.
            Clients.Caller.getStock(stock);
        }

        public Task JoinDepartment(string departmentName)
        {
            return Groups.Add(Context.ConnectionId, departmentName);
        }

        public Task LeaveDepartment(string departmentName)
        {
            return Groups.Remove(Context.ConnectionId, departmentName);
        }

        public void UpdateAmount(string departmentName, int id, int newAmount)
        {
            Product product = stock.SingleOrDefault(p => p.Id == id);
            if (product != null)
            {
                product.Amount = newAmount;
                // Deze regel roept de updateAmount functie aan in de JavaScript.
                Clients.Group(departmentName).updateAmount(id, newAmount);
            }
        }
    }
}