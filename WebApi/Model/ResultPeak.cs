namespace WebApi.Model
{
    public class ResultPeak : BasePeak
    {
        public double ElevationMeters { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public double DistanceKm { get; set; }

        public double? HikeDistanceKm { get; set; }

        public double? ElevationGain { get; set; }

        public double? EstimatedTimeHours { get; set; }
    }
}
