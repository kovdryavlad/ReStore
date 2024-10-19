using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using API.RequestHelpers;

namespace API.Extensions;

public static class HttpExtentions
{
    public static void AddPaginationHeader(this HttpResponse response, MetaData metaData)
    {
        var options = new JsonSerializerOptions{PropertyNamingPolicy = JsonNamingPolicy.CamelCase};

        response.Headers.TryAdd("Pagination", JsonSerializer.Serialize(metaData, options));
 
        response.Headers.TryAdd("Access-Control-Expose-Headers", "Pagination");
    }
}
