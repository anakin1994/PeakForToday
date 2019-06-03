using Microsoft.Azure.Documents.Client;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using WebApi.Model;

namespace WebApi.Repository
{
    public class PeaksRepository
    {
        private readonly string _databaseName = "peaks";
        private readonly string _collectionName = "peaks";
        private readonly DocumentClient client;
        private static List<SourcePeak> _allPeaks;

        public PeaksRepository(string endpointUri, string primaryKey)
        {
            if (string.IsNullOrEmpty(endpointUri))
                endpointUri = GetEndpointUri();

            if (string.IsNullOrEmpty(primaryKey))
                primaryKey = GetPrimaryKey();

            client = new DocumentClient(new Uri(endpointUri), primaryKey);
        }

        public List<SourcePeak> GetAllPeaks()
        {
            return _allPeaks ?? (_allPeaks = GetAllPeaksFromDb());
        }

        public async Task UpdatePeak(SourcePeak peak)
        {
            await client.ReplaceDocumentAsync(UriFactory.CreateDocumentUri(_databaseName, _collectionName, peak.Id), peak);
        }

        private static string GetEndpointUri()
        {
            const string filePath = "Secrets/CosmosEndpointUri";
            using (var reader = new StreamReader(filePath))
            {
                return reader.ReadToEnd();
            }
        }

        private static string GetPrimaryKey()
        {
            const string filePath = "Secrets/CosmosPrimaryKey";
            using (var reader = new StreamReader(filePath))
            {
                return reader.ReadToEnd();
            }
        }

        private List<SourcePeak> GetAllPeaksFromDb()
        {
            return client.CreateDocumentQuery<SourcePeak>(UriFactory.CreateDocumentCollectionUri(_databaseName, _collectionName)).ToList();
        }
    }
}
