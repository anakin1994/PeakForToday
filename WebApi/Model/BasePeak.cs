using Newtonsoft.Json;

namespace WebApi.Model
{
    public class BasePeak
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        public string Name { get; set; }

        public string Slug { get; set; }
    }
}
