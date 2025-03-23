using System;
using PizzaShop.Repository.Models;
using PizzaShop.Repository.ModelView;

namespace PizzaShop.Service.Interfaces;

public interface ISectionService
{


    // section crud
    Task<SectionsHelperViewModel> GetSectionsAsync(int? sectionId = null, string? searchTable = null, int pageNumber = 1, int pageSize = 5);
    Task AddSectionService(SectionsHelperViewModel model);
    Task EditSectionService(SectionsHelperViewModel model);
    Task<bool> DeleteSectionService(SectionsHelperViewModel model);
    
    
    // table crud
    Task AddTableService(SectionsHelperViewModel model);
    Task<bool> DeleteTableService(int tableId, int userId);
    Task EditTableService(SectionsHelperViewModel model);

}
