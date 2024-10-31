using System.Text.Json.Serialization;

namespace ArcheryShop.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Address { get; set; }

        [JsonIgnore]
        public List<Order>? Orders { get; set; }
    }

}
