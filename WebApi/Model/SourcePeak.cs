using System.Collections.Generic;
using WebApi.GeoLocation;

namespace WebApi.Model
{
	public class SourcePeak : BasePeak
	{
		public double Elevation { get; set; }

		public double Lat { get; set; }

		public double Lng { get; set; }

		public List<double> NearestRoad { get; set; }

		public int? StartElevation { get; set; }

		public bool Cached { get; set; }

		public double GetDistanceToKm(double latitude, double longitude)
		{
			return GeoService.CalcDistanceInKm(Lat, Lng, latitude, longitude);
		}
	}
}
