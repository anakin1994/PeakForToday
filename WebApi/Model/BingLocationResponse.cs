using System.Collections.Generic;

namespace WebApi.Model
{
    public class BingLocationResponse
    {
        public List<ResourceSet> ResourceSets { get; set; }
    }

    public class ResourceSet
    {
        public List<Resource> Resources { get; set; }
    }

    public class Resource
    {
        public Point Point { get; set; }

        public List<SnappedPoint> SnappedPoints { get; set; }

        public List<RouteLeg> RouteLegs { get; set; }

        public List<int> Elevations { get; set; }
    }

    public class Point
    {
        public List<double> Coordinates { get; set; }
    }

    public class SnappedPoint
    {
        public Coordinate Coordinate { get; set; }
    }

    public class Coordinate
    {
        public double Latitude { get; set; }

        public double Longitude { get; set; }
    }

    public class RouteLeg
    {
        public EndData ActualEnd { get; set; }
    }

    public class EndData
    {
        public List<double> Coordinates { get; set; }
    }
}
