using System;

namespace PizzaShop.Repository.ModelView;

public class OrderDetailsHelperViewModel
{
    //order details
    public int Orderid { get; set; }

    public int Status { get; set; }

    public int Paymentmode { get; set; }

    public decimal? Ratings { get; set; }

    public decimal Totalamount { get; set; }

    public string? Orderdescription { get; set; }

    public DateTime? Createdat { get; set; }

    public DateTime? Editedat { get; set; }
 
    public int? Totalpersons { get; set; }


    //customer details
    public int Customerid { get; set; }

    public string Customername { get; set; } = null!;

    public string Customeremail { get; set; } = null!;

    public decimal Customerphone { get; set; }
}
