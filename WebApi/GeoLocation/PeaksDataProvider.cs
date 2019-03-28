using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;
using WebApi.Model;

namespace WebApi.GeoLocation
{
    public static class PeaksDataProvider
    {
        private static List<SourcePeak> _allPeaks;

        public static List<SourcePeak> GetAllPeaks()
        {
            return _allPeaks ?? (_allPeaks = ReadFromFile());
        }

        private static List<SourcePeak> ReadFromFile()
        {
            const string filePath = "Data/peaks";
            using (var reader = new StreamReader(filePath))
            {
                var json = reader.ReadToEnd();
                return JsonConvert.DeserializeObject<List<SourcePeak>>(json);
            }
        }
    }
}
