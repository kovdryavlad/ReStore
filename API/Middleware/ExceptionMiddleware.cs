using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(
        RequestDelegate next,
        ILogger<ExceptionMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 500;

            var response = new ProblemDetails()
            {
                Status = 500,
                //Detail = _env.IsDevelopment() ? ex.StackTrace?.ToString() : null,
                Detail = GetProblemDetail(ex),
                Title = ex.Message
            };

            var options = new JsonSerializerOptions()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            };

            var json = JsonSerializer.Serialize(response, options);

            await context.Response.WriteAsync(json);
        }
    }

    private string GetProblemDetail(Exception ex)
    {
        var sb = new StringBuilder();
        sb.Append($"Error occurred;");
        sb.AppendLine();

        WriteException(sb, ex);

        return sb.ToString();
    }

    private static void WriteException(StringBuilder sb, Exception exception, string path = "")
    {
        sb.Append(path).AppendLine($"Exception type: {exception.GetType().Name}")
            .Append(path).AppendLine($"Message: {exception.Message}")
            .Append(path).AppendLine($"Stack trace: {exception.StackTrace}");

        if (exception is AggregateException ae)
        {
            sb.AppendLine()
                .Append(path).AppendLine("With inner exceptions:");
            foreach (var innerException in ae.InnerExceptions)
            {
                WriteException(sb, innerException, $"{path}{exception.GetType().Name}>");
            }
        }

        if (exception.InnerException != null)
        {
            sb.AppendLine()
                .Append(path).AppendLine("With inner exception:");

            WriteException(sb, exception.InnerException, $"{path}{exception.GetType().Name}>");
        }
    }
}
