using System.Text.Encodings.Web;
using Ganss.Xss;

namespace Api.Infrastructure.Notifications;

public static class EmailContentSanitizer
{
    private static readonly HtmlSanitizer Sanitizer = new();

    public static string EncodePlainText(string? value) =>
        HtmlEncoder.Default.Encode(value ?? string.Empty);

    public static string SanitizeRichText(string? value) =>
        Sanitizer.Sanitize(value ?? string.Empty);
}
