using System;
using iText.Kernel.Pdf;
using PizzaShop.Repository.Interfaces;
using PizzaShop.Repository.Models;
using PizzaShop.Repository.ModelView;
using PizzaShop.Service.Interfaces;
using static PizzaShop.Repository.Helpers.Enums;

using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using iText.Kernel.Colors;
using iText.Kernel.Geom;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using iText.IO.Image;
using iText.Layout.Borders;
using Microsoft.AspNetCore.Hosting;
using iText.Kernel.Pdf.Canvas.Draw;

namespace PizzaShop.Service.Implementations;

public class OrderService : IOrderService
{
    private readonly IGenericRepository<Order> _orders;
    private readonly IWebHostEnvironment _webHostEnvironment;
    public OrderService(IGenericRepository<Order> orders,
    IWebHostEnvironment webHostEnvironment)
    {
        _orders = orders;
        _webHostEnvironment = webHostEnvironment;
    }

    public async Task<OrdersHelperModelView> GetOrders(
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
    )
    {
        List<OrderCutstomerViewModel>? orders = await _orders.GetAllCustomerOrderMappingAsync();
        if (orders != null)
        {
            // search term
            if (!string.IsNullOrEmpty(searchTerm))
            {
                orders = orders.Where(o => (o?.Orderid != null && o.Orderid.ToString().Contains(searchTerm)) ||
                                          (o?.Customername != null && o.Customername.ToLower().Contains(searchTerm.ToLower()))).ToList();
            }
            if (status.HasValue)
            {
                orders = orders.Where(o => o.Status == status.Value).ToList();
            }
            if (!string.IsNullOrEmpty(dateRange) && fromDate == null && toDate == null && int.TryParse(dateRange, out int dateRangeValue) && Enum.IsDefined(typeof(DateRange), dateRangeValue))
            {
                DateTime currentDate = DateTime.Today;
                switch ((DateRange)dateRangeValue)
                {
                    case DateRange.AllTime:
                        // No filtering needed, keep all orders
                        break;
                    case DateRange.Last7days:
                        orders = orders.Where(o => o.Createdat >= currentDate.AddDays(-7)).ToList();
                        break;
                    case DateRange.Last30days:
                        orders = orders.Where(o => o.Createdat >= currentDate.AddDays(-30)).ToList();
                        break;
                    case DateRange.CurrentMonth:
                        DateTime firstDayOfMonth = new DateTime(currentDate.Year, currentDate.Month, 1);
                        orders = orders.Where(o => o.Createdat >= firstDayOfMonth).ToList();
                        break;
                }
            }
            if (!string.IsNullOrEmpty(fromDate) && DateTime.TryParse(fromDate, out var from))
            {
                orders = orders.Where(o => o.Createdat >= from).ToList();
            }
            if (!string.IsNullOrEmpty(toDate) && DateTime.TryParse(toDate, out var to))
            {
                orders = orders.Where(o => o.Createdat <= to).ToList();
            }
        }

        int totalItems = orders?.Count ?? 0;
        orders = orders?.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();



        // Apply sorting (only one sort at a time)
        if (orderAscending)
        {
            orders = orders?.OrderBy(o => o.Orderid).ToList();
        }
        else if (orderDescending)
        {
            orders = orders?.OrderByDescending(o => o.Orderid).ToList();
        }
        else if (dateAscending)
        {
            orders = orders?.OrderBy(o => o.Createdat).ToList();
        }
        else if (dateDescending)
        {
            orders = orders?.OrderByDescending(o => o.Createdat).ToList();
        }
        else if (nameAscending)
        {
            orders = orders?.OrderBy(o => o.Customername).ToList();
        }
        else if (nameDescending)
        {
            orders = orders?.OrderByDescending(o => o.Customername).ToList();
        }
        else if (amountAscending)
        {
            orders = orders?.OrderBy(o => o.Totalamount).ToList();
        }
        else if (amountDescending)
        {
            orders = orders?.OrderByDescending(o => o.Totalamount).ToList();
        }


        return new OrdersHelperModelView
        {
            orders = orders,
            CurrentPage = pageNumber,
            PageSize = pageSize,
            TotalItems = totalItems
        };
    }


    public async Task<OrderDetailsHelperViewModel?> getOrderDetails(int orderId)
    {

        OrderDetailsHelperViewModel? order = await _orders.GetOrderDetailsByOrderId(orderId);

        if (order != null) return order;
        else return null;
    }

    public async Task<byte[]> GenerateInvoicePdf(int orderId)
    {
        OrderDetailsHelperViewModel? order = await _orders.GetOrderDetailsByOrderId(orderId);
        if (order == null)
        {
            throw new Exception("Order not found.");
        }

        using (var memoryStream = new MemoryStream())
        {
            PdfWriter writer = new PdfWriter(memoryStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);

            document.SetMargins(20, 30, 20, 30);

            // Create a table for the header with equal columns for logo and text
            iText.Layout.Element.Table headerTable = new iText.Layout.Element.Table(UnitValue.CreatePercentArray(new float[] { 50, 50 })); // Equal width for logo and text

            // Add image to the left column, centered
            string imagePath = System.IO.Path.Combine(_webHostEnvironment.WebRootPath, "images", "pizzashop_logo.png"); // Use IWebHostEnvironment
            if (System.IO.File.Exists(imagePath))
            {
                iText.Layout.Element.Image logo = new iText.Layout.Element.Image(ImageDataFactory.Create(imagePath))
                    .SetWidth(50)
                    .SetHorizontalAlignment(HorizontalAlignment.CENTER);
                headerTable.AddCell(new Cell()
                    .Add(logo)
                    .SetBorder(Border.NO_BORDER)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetVerticalAlignment(VerticalAlignment.MIDDLE));
            }
            else
            {
                headerTable.AddCell(new Cell()
                    .Add(new Paragraph("Logo"))
                    .SetBorder(Border.NO_BORDER)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetVerticalAlignment(VerticalAlignment.MIDDLE));
            }

            // Add text to the right column, centered
            Paragraph headerText = new Paragraph("PIZZASHOP")
                .SetFontSize(20)
                .SetBold()
                .SetTextAlignment(TextAlignment.CENTER)
                .SetFontColor(new DeviceRgb(5, 101, 166));
            headerTable.AddCell(new Cell()
                .Add(headerText)
                .SetBorder(Border.NO_BORDER)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetVerticalAlignment(VerticalAlignment.MIDDLE));

            // Center the entire header table
            headerTable.SetHorizontalAlignment(HorizontalAlignment.CENTER);
            headerTable.SetMarginBottom(10); // Optional: Add spacing below header

            // Add the header table to the document
            document.Add(headerTable);





            iText.Layout.Element.Table DetailsTable = new iText.Layout.Element.Table(UnitValue.CreatePercentArray(new float[] { 50, 50 }))
                .UseAllAvailableWidth()
                .SetMarginTop(5);

            // Customer Details (left column)
            Div customerDiv = new Div();
            customerDiv.Add(new Paragraph("Customer Details")
                .SetFontSize(11)
                .SetBold()
                .SetFontColor(new DeviceRgb(5, 101, 166))
                .SetMarginBottom(4));
            customerDiv.Add(new Paragraph($"Name: {order.Customername ?? "customer"}")
                .SetFontSize(10)
                .SetMarginTop(2));
            customerDiv.Add(new Paragraph($"Mob: {order.Customerphone}")
                .SetFontSize(10)
                .SetMarginTop(2));
            DetailsTable.AddCell(new Cell()
                .Add(customerDiv)
                .SetBorder(Border.NO_BORDER)
                .SetTextAlignment(TextAlignment.LEFT)
                .SetVerticalAlignment(VerticalAlignment.TOP)
                .SetPaddingLeft(0));

            // Order Details (right column)
            Div orderDiv = new Div();
            orderDiv.Add(new Paragraph("Order Details")
                .SetFontSize(11)
                .SetBold()
                .SetFontColor(new DeviceRgb(5, 101, 166))
                .SetMarginBottom(4));
            orderDiv.Add(new Paragraph($"Invoice Number: {order.Orderid}")
                .SetFontSize(10)
                .SetMarginTop(2));
            orderDiv.Add(new Paragraph($"Date: {order.Createdat?.ToString("yyyy-MM-dd HH:mm:ss")}")
                .SetFontSize(10)
                .SetMarginTop(2));
            DetailsTable.AddCell(new Cell()
                .Add(orderDiv)
                .SetBorder(Border.NO_BORDER)
                .SetTextAlignment(TextAlignment.LEFT)
                .SetVerticalAlignment(VerticalAlignment.TOP)
                .SetPaddingLeft(0));

            // Add the DetailsTable to the document
            document.Add(DetailsTable);


            // Items Table


            //line
            LineSeparator line = new LineSeparator(new SolidLine(1f)) // 1f is the line thickness
                .SetStrokeColor(new DeviceRgb(5, 101, 166))
                .SetMarginBottom(5); // Space below the line
            document.Add(line);
            iText.Layout.Element.Table AmountTable = new iText.Layout.Element.Table(UnitValue.CreatePercentArray(new float[] { 50, 50 }))
                .UseAllAvailableWidth(); // Ensure the table spans the full width

            // Total Amount Label (leftmost)
            Paragraph total = new Paragraph("Total Amount Due:")
                .SetFontSize(12)
                .SetBold()
                .SetFontColor(new DeviceRgb(5, 101, 166))
                .SetTextAlignment(TextAlignment.LEFT)
                .SetMarginTop(10);
            AmountTable.AddCell(new Cell()
                .Add(total)
                .SetBorder(Border.NO_BORDER)
                .SetTextAlignment(TextAlignment.LEFT) // Align text to the leftmost edge
                .SetVerticalAlignment(VerticalAlignment.MIDDLE)
                .SetPaddingLeft(0)); // Remove padding to push it fully left

            // Total Amount Value (rightmost)
            Paragraph totalAmount = new Paragraph(@$"₹{order.Totalamount:F2}")
                .SetFontSize(12)
                .SetBold()
                .SetFontColor(new DeviceRgb(5, 101, 166))
                .SetTextAlignment(TextAlignment.RIGHT)
                .SetMarginTop(10);
            AmountTable.AddCell(new Cell()
                .Add(totalAmount)
                .SetBorder(Border.NO_BORDER)
                .SetTextAlignment(TextAlignment.RIGHT) // Align text to the rightmost edge
                .SetVerticalAlignment(VerticalAlignment.MIDDLE)
                .SetPaddingRight(0)); // Remove padding to push it fully right

            document.Add(AmountTable);




            document.Add(new Paragraph($"Payment Information")
                .SetFontSize(11)
                .SetFontColor(new DeviceRgb(5, 101, 166))
                .SetMarginTop(5));
            document.Add(new Paragraph($"Payment Mode: {order.Paymentmode}")
                .SetFontSize(10)
                .SetMarginTop(4));
            document.Add(new Paragraph($"Status: {order.Status}")
                .SetFontSize(10)
                .SetMarginTop(2));






            // Footer
            Paragraph footer = new Paragraph("THANK YOU!")
                .SetFontSize(14)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginTop(10);
            document.Add(footer);

            // Close document
            document.Close();

            return memoryStream.ToArray();
        }
    }


}
