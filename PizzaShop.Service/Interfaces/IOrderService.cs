using System;
using PizzaShop.Repository.ModelView;

namespace PizzaShop.Service.Interfaces;

public interface IOrderService
{
    public Task<OrdersHelperModelView> GetOrders(
    string? searchTerm = null,
    int pageNumber = 1,
    int pageSize = 5,
    int? status = null,
    string? dateRange = null,
    string? fromDate = null,
    string? toDate = null,
    bool orderAscending = false,
    bool orderDescending = false,
    bool dateAscending = false,
    bool dateDescending = false,
    bool nameAscending = false,
    bool nameDescending = false,
    bool amountAscending = false,
    bool amountDescending = false
    );

    public Task<OrderDetailsHelperViewModel?> getOrderDetails(int orderId);

    Task<byte[]> GenerateInvoicePdf(int orderId);
}
