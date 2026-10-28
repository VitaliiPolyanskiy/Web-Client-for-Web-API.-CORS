var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.UseStaticFiles(); // дозволяє застосунку ASP.NET Core обслуговувати статичні файли
                      // (наприклад, HTML, CSS, JavaScript або зображення) зазвичай із wwwroot

app.UseHttpsRedirection(); // перенаправляє всі незахищені HTTP-запити на безпечний протокол HTTPS
                           // Це гарантує, що весь трафік між клієнтом і сервером буде зашифрований.
                           // У сучасній розробці це є обов'язковим стандартом, щоб уникнути перехоплення даних.

app.Run();