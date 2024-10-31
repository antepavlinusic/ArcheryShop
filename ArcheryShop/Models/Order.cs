using ArcheryShop.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime? OrderDate { get; set; } = DateTime.Now;
    public decimal TotalAmount { get; set; }
    public string Address { get; set; }

    [JsonIgnore] // Avoids circular reference with User
    public User? User { get; set; }

    [JsonIgnore] // Avoids circular reference with OrderItems
    public List<OrderItem>? OrderItems { get; set; }
}
