using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using WebApi.GeoLocation;
using WebApi.Model;

namespace WebApi.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class PeaksController : Controller
	{
		private readonly IConfiguration _config;

		public PeaksController(IConfiguration config)
		{
			_config = config;
		}

		[HttpGet("[action]")]
		public async Task<ActionResult<List<ResultPeak>>> PeaksNear(string location, int radiusKm)
		{
			var coordinates = await GeoService.GetCoordsByLocation(location, _config["BingMapsApiKey"]);
			return await GetPeaksInRadius(coordinates[0], coordinates[1], radiusKm);
		}

		private async Task<ActionResult<List<ResultPeak>>> GetPeaksInRadius(double latitude, double longitude, int radiusKm)
		{
			var selectedPeaks = PeaksDataProvider.GetAllPeaks()
				.Where(p => p.GetDistanceToKm(latitude, longitude) <= radiusKm);

			var bingMapsRequestCount = GetBingMapsRequestCount(selectedPeaks);
			if (bingMapsRequestCount > int.Parse(_config["BingMapsRequestLimit"]))
				return StatusCode(429);

			return await PrepareResults(selectedPeaks, latitude, longitude);
		}

		private int GetBingMapsRequestCount(IEnumerable<SourcePeak> peaks)
		{
			return 2 * peaks.Count(p => !p.Cached);
		}

		private async Task<List<ResultPeak>> PrepareResults(IEnumerable<SourcePeak> source, double latitude, double longitude)
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
				sourcePeak.Cached = true;

				var peakElevation = 0.3048 * sourcePeak.Elevation;
				var hikeDistanceKm = sourcePeak.NearestRoad != null
					? GeoService.CalcDistanceInKm(sourcePeak.NearestRoad[0], sourcePeak.NearestRoad[1], sourcePeak.Lat,
						  sourcePeak.Lng) * 2
					: (double?)null;
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
					EstimatedTimeHours = hikeDistanceKm / 2 + elevationGain / 400
				});
			}

			return resultPeaks;
		}

		private Task<List<double>>[] PrepareRoadTasks(SourcePeak[] sourcePeaks, double latitude, double longitude)
		{
			var roadTasks = new Task<List<double>>[sourcePeaks.Length];
			for (int i = 0; i < sourcePeaks.Length; i++)
			{
				if (!sourcePeaks[i].Cached)
				{
					roadTasks[i] =
						GeoService.GetNearestRoad(latitude, longitude, sourcePeaks[i].Lat, sourcePeaks[i].Lng,
							_config["BingMapsApiKey"]);
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
					if (!sourcePeaks[i].Cached)
					{
						var nearestRoad = sourcePeaks[i].NearestRoad ?? (sourcePeaks[i].NearestRoad = await roadTasks[i]);
						elevationTasks[i] =
							GeoService.GetPointElevation(nearestRoad[0], nearestRoad[1], _config["BingMapsApiKey"]);
					}
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