using System;
using PizzaShop.Repository.Models;

namespace PizzaShop.Repository.ModelView;

public class OrdersHelperModelView
{
    public List<OrderCutstomerViewModel>? orders { get; set; }


    public int CurrentPage {get;set;}
    public int PageSize {get;set;}
    public int TotalItems {get;set;}
}
