using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using WebApi.Model;

namespace WebApi.Data
{
    public static class PeaksDataProvider
    {
        private static List<Peak> _allPeaks;

        public static List<Peak> GetAllPeaks()
        {
            return _allPeaks ?? (_allPeaks = ReadFromFile());
        }

        private static List<Peak> ReadFromFile()
        {
            const string filePath = "Data/peaks";
            using (var reader = new StreamReader(filePath))
            {
                var json = reader.ReadToEnd();
                return JsonConvert.DeserializeObject<List<Peak>>(json);
            }
        }
    }
}
