using System.Collections.Generic;

namespace WebApi.Model
{
    public class PeaksResponse
    {
        public IEnumerable<ResultPeak> Peaks { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }
    }
}
