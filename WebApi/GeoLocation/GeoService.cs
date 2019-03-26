using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using WebApi.Model;

namespace WebApi.GeoLocation
{
    public static class GeoService
    {
        private static readonly HttpClient Client = new HttpClient();

        public static double CalcDistanceInKm(double startLat, double startLng, double endLat, double endLng)
        {
            var d1 = startLat * (Math.PI / 180.0);
            var num1 = startLng * (Math.PI / 180.0);
            var d2 = endLat * (Math.PI / 180.0);
            var num2 = endLng * (Math.PI / 180.0) - num1;
            var d3 = Math.Pow(Math.Sin((d2 - d1) / 2.0), 2.0) +
                     Math.Cos(d1) * Math.Cos(d2) * Math.Pow(Math.Sin(num2 / 2.0), 2.0);

            return 6376500.0 * (2.0 * Math.Atan2(Math.Sqrt(d3), Math.Sqrt(1.0 - d3))) / 1000;
        }

        public static async Task<List<double>> GetNearestRoad(double startLat, double startLng, double endLat,
            double endLng)
        {
            var bingMapsApiKey = GetBingMapsApiKey();
            var requestUrl =
                $"http://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0={startLat},{startLng}&wp.1={endLat},{endLng}&key={bingMapsApiKey}";
            var nearestRoadJson = await Client.GetStringAsync(requestUrl);
            var nearestRoad = JsonConvert.DeserializeObject<BingLocationResponse>(nearestRoadJson);

            return nearestRoad.ResourceSets.First().Resources.First().RouteLegs.First().ActualEnd.Coordinates;
        }

        public static async Task<List<double>> GetCoordsByLocation(string location)
        {
            var bingMapsApiKey = GeoService.GetBingMapsApiKey();
            var requestUrl = $"http://dev.virtualearth.net/REST/v1/Locations/{location}?inclnb=1&key={bingMapsApiKey}";
            var bingLocationJson = await Client.GetStringAsync(requestUrl);
            var bingLocation = JsonConvert.DeserializeObject<BingLocationResponse>(bingLocationJson);
            return bingLocation.ResourceSets.First().Resources.First().Point.Coordinates;
        }

        public static async Task<int> GetPointElevation(double latitude, double longitude)
        {
            var bingMapsApiKey = GeoService.GetBingMapsApiKey();
            var requestUrl =
                $"http://dev.virtualearth.net/REST/v1/Elevation/List?points={latitude},{longitude}&key={bingMapsApiKey}";
            var bingLocationJson = await Client.GetStringAsync(requestUrl);
            var bingLocation = JsonConvert.DeserializeObject<BingLocationResponse>(bingLocationJson);
            return bingLocation.ResourceSets.First().Resources.First().Elevations[0];
        }

        private static string GetBingMapsApiKey()
        {
            const string filePath = "Secrets/BingMapsApiKey";
            using (var reader = new StreamReader(filePath))
            {
                return reader.ReadToEnd();
            }
        }
    }
}
