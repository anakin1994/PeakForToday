using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace WebApi.Model
{
    public class Peak
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public double Lat { get; set; }

        public double Lng { get; set; }

        public double Elevation { get; set; }

        public string Slug { get; set; }

        public double GetDistanceToKm(double latitude, double longitude)
        {
            var d1 = Lat * (Math.PI / 180.0);
            var num1 = Lng * (Math.PI / 180.0);
            var d2 = latitude * (Math.PI / 180.0);
            var num2 = longitude * (Math.PI / 180.0) - num1;
            var d3 = Math.Pow(Math.Sin((d2 - d1) / 2.0), 2.0) +
                     Math.Cos(d1) * Math.Cos(d2) * Math.Pow(Math.Sin(num2 / 2.0), 2.0);

            return 6376500.0 * (2.0 * Math.Atan2(Math.Sqrt(d3), Math.Sqrt(1.0 - d3))) / 1000;
        }
    }
}
