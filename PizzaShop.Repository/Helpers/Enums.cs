using System;

namespace PizzaShop.Repository.Helpers;

public class Enums
{
    public enum TaxTypes
    {
        Percentage = 1,
        Fixed = 2,
    }

    public enum OrderStatus {
        Pending = 1, Failed = 2, InProgress = 3, Served = 4, Completed = 5, Cancelled = 6, OnHold = 7, AllStatus=8
    }

    public enum DateRange {
       AllTime = 1, Last7days = 2, Last30days = 3,  CurrentMonth = 4
    }
}
