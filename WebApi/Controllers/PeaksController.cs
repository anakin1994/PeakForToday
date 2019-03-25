using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data;
using WebApi.Model;

namespace WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PeaksController : Controller
    {
        [HttpGet("[action]")]
        public IEnumerable<Peak> PeaksInRadius(double latitude, double longitude, int radiusKm)
        {
            var allPeaks = PeaksDataProvider.GetAllPeaks();
            return allPeaks.Where(p => p.GetDistanceToKm(latitude, longitude) <= radiusKm);
        }
    }
}