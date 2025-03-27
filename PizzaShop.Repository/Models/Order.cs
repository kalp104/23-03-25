using System;
using System.Collections.Generic;

namespace PizzaShop.Repository.Models;

public partial class Order
{
    public int Orderid { get; set; }

    public int Status { get; set; }

    public int Paymentmode { get; set; }

    public decimal? Ratings { get; set; }

    public decimal Totalamount { get; set; }

    public string? Orderdescription { get; set; }

    public DateTime? Createdat { get; set; }

    public DateTime? Editedat { get; set; }

    public int? Createdbyid { get; set; }

    public int? Editedbyid { get; set; }

    public int? Deletedbyid { get; set; }

    public bool? Isdeleted { get; set; }

    public DateTime? Deletedat { get; set; }

    public int? Totalpersons { get; set; }

    public virtual ICollection<OrdersCustomersMapping> OrdersCustomersMappings { get; set; } = new List<OrdersCustomersMapping>();
}
