using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(SignalRSite.Startup))]

namespace SignalRSite
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}