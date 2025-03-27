using System;
using PizzaShop.Repository.Interfaces;
using PizzaShop.Repository.Models;
using PizzaShop.Repository.ModelView;
using PizzaShop.Service.Interfaces;

namespace PizzaShop.Service.Implementations;

public class TaxService : ITaxService
{
    private readonly IGenericRepository<TaxAndFee> _tax;
    public TaxService(IGenericRepository<TaxAndFee> tax)
    {
        _tax = tax;
    }


    // index page get all tax service
    public async Task<TaxHelperViewModel> GetTaxesAsync(int? taxId = null, string? searchTax = null)
    {

        List<TaxAndFee>? tax = await _tax.GetAllAsync();
        tax = tax.Where(u => u.Isdeleted == false).OrderBy(u => u.Taxid).ToList();

        if (!string.IsNullOrEmpty(searchTax))
        {
            searchTax = searchTax.ToLower();
            tax = tax.Where(u => u.Taxname.ToLower().Contains(searchTax)).ToList();
        }


        TaxHelperViewModel taxHelper = new TaxHelperViewModel();
        taxHelper.TaxHelpers = tax;
        taxHelper.Taxid = taxId ?? 0;
        return taxHelper;
    }

    public async Task AddTaxAsync(TaxHelperViewModel newTax, int userid)
    {
        if (newTax != null && userid != 0)
        {
            TaxAndFee tax = new TaxAndFee();
            tax.Taxname = newTax.Taxname;
            tax.Taxamount = newTax.Taxamount;
            tax.Isdefault = newTax.Isdefault;
            tax.Taxtype = newTax.Taxtype;
            tax.Isenabled = newTax.Isenabled;
            tax.Isdeleted = false;
            tax.Createdat = DateTime.Now;
            tax.Createdbyid = userid;
            tax.Editedat = DateTime.Now;
            tax.Editedbyid = userid;
            await _tax.AddAsync(tax);
        }
    }


    public async Task DeleteTaxAsync(int taxId, int userid)
    {
        TaxAndFee? tax = await _tax.GetByIdAsync(taxId);
        if (tax != null)
        {
            tax.Isdeleted = true;
            tax.Editedat = DateTime.Now;
            tax.Editedbyid = userid;
            tax.Deletedbyid = userid;
            tax.Deletedat = DateTime.Now;
            await _tax.UpdateAsync(tax);
        }
    }

    public async Task EditTaxAsync(TaxHelperViewModel model, int userid)
    {
        TaxAndFee? tax = await _tax.GetByIdAsync(model.Taxid);
        if (tax != null)
        {
            tax.Taxname = model.Taxname;
            tax.Taxamount = model.Taxamount;
            tax.Isdefault = model.Isdefault;
            tax.Taxtype = model.Taxtype;
            tax.Isenabled = model.Isenabled;
            tax.Isdeleted = false;
            tax.Editedat = DateTime.Now;
            tax.Editedbyid = userid;
            await _tax.UpdateAsync(tax);
        }
    }
}
