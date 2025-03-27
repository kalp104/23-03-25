using System;
using PizzaShop.Repository.ModelView;

namespace PizzaShop.Service.Interfaces;

public interface ITaxService
{
    Task<TaxHelperViewModel> GetTaxesAsync(int? taxId = null, string? searchTax = null);

    Task AddTaxAsync(TaxHelperViewModel newTax, int userid);

    Task DeleteTaxAsync(int taxId, int userid);

    Task EditTaxAsync(TaxHelperViewModel model, int userid);
    

}
