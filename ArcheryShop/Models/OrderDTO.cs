namespace ArcheryShop.Models
{
    public class OrderDTO
    {
        public string Username { get; set; }
        public decimal TotalAmount { get; set; }
        public string Address { get; set; }
        public List<OrderItem> OrderItems { get; set; }
    }
}
