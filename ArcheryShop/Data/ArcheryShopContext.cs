using Microsoft.EntityFrameworkCore;
using ArcheryShop.Models;
using System.Collections.Generic;

namespace ArcheryShop.Data
{
    public class ArcheryShopContext : DbContext
    {
        public ArcheryShopContext(DbContextOptions<ArcheryShopContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
    }
}
