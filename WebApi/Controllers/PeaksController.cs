using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data;
using WebApi.GeoLocation;
using WebApi.Model;

namespace WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PeaksController : Controller
    {
        [HttpGet("[action]")]
        public async Task<PeaksResponse> PeaksInRadius(double latitude, double longitude, int radiusKm)
        {
            return await GetPeaksInRadius(latitude, longitude, radiusKm);
        }

        [HttpGet("[action]")]
        public async Task<PeaksResponse> PeaksNear(string location, int radiusKm)
        {
            var coordinates = await GeoService.GetCoordsByLocation(location);
            return await GetPeaksInRadius(coordinates[0], coordinates[1], radiusKm);
        }

        private async Task<PeaksResponse> GetPeaksInRadius(double latitude, double longitude, int radiusKm)
        {
            var selectedPeaks = PeaksDataProvider.GetAllPeaks()
                .Where(p => p.GetDistanceToKm(latitude, longitude) <= radiusKm);
            return await PrepareResults(selectedPeaks, latitude, longitude);
        }

        private async Task<PeaksResponse> PrepareResults(IEnumerable<SourcePeak> source, double latitude, double longitude)
        {
            var resultPeaks = new List<ResultPeak>();
            var sourcePeaks = source as SourcePeak[] ?? source.ToArray();

            var roadTasks = PrepareRoadTasks(sourcePeaks, latitude, longitude);
            var elevationTasks = await PrepareElevationTasks(sourcePeaks, roadTasks);

            for (int i = 0; i < sourcePeaks.Length; i++)
            {
                var sourcePeak = sourcePeaks[i];
                var startElevation = sourcePeak.StartElevation ?? (elevationTasks[i] != null
                                         ? sourcePeak.StartElevation = await elevationTasks[i]
                                         : null);

                var peakElevation = 0.3048 * sourcePeak.Elevation;
                var hikeDistanceKm = sourcePeak.NearestRoad != null
                    ? GeoService.CalcDistanceInKm(sourcePeak.NearestRoad[0], sourcePeak.NearestRoad[1], sourcePeak.Lat,
                          sourcePeak.Lng) * 2
                    : (double?) null;
                var elevationGain = peakElevation - startElevation;
                if (elevationGain < 0)
                    elevationGain = 0;

                resultPeaks.Add(new ResultPeak
                {
                    Id = sourcePeak.Id,
                    ElevationMeters = peakElevation,
                    Latitude = sourcePeak.Lat,
                    Longitude = sourcePeak.Lng,
                    Name = sourcePeak.Name,
                    Slug = sourcePeak.Slug,
                    DistanceKm = sourcePeak.GetDistanceToKm(latitude, longitude),
                    HikeDistanceKm = hikeDistanceKm,
                    ElevationGain = elevationGain,
                    EstimatedTimeHours = hikeDistanceKm / 4 + elevationGain / 600
                });
            }

            return new PeaksResponse
            {
                Peaks = resultPeaks,
                Latitude = latitude,
                Longitude = longitude
            };
        }

        private Task<List<double>>[] PrepareRoadTasks(SourcePeak[] sourcePeaks, double latitude, double longitude)
        {
            var roadTasks = new Task<List<double>>[sourcePeaks.Length];
            for (int i = 0; i < sourcePeaks.Length; i++)
            {
                if (sourcePeaks[i].NearestRoad == null)
                {
                    roadTasks[i] =
                        GeoService.GetNearestRoad(latitude, longitude, sourcePeaks[i].Lat, sourcePeaks[i].Lng);
                }
            }

            return roadTasks;
        }

        private async Task<Task<int>[]> PrepareElevationTasks(SourcePeak[] sourcePeaks, Task<List<double>>[] roadTasks)
        {
            var elevationTasks = new Task<int>[sourcePeaks.Length];
            for (int i = 0; i < sourcePeaks.Length; i++)
            {
                try
                {
                    var nearestRoad = sourcePeaks[i].NearestRoad ?? (sourcePeaks[i].NearestRoad = await roadTasks[i]);
                    if (sourcePeaks[i].StartElevation == null)
                        elevationTasks[i] = GeoService.GetPointElevation(nearestRoad[0], nearestRoad[1]);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    // Nearest road and elevation stays null
                }
            }

            return elevationTasks;
        }
    }
}