using System;
using System.Collections.Specialized;
using PizzaShop.Repository.Interfaces;
using PizzaShop.Repository.Models;
using PizzaShop.Repository.ModelView;
using PizzaShop.Service.Interfaces;

namespace PizzaShop.Service.Implementations;

public class SectionService : ISectionService
{
    private readonly IGenericRepository<Section> _section;
    private readonly IGenericRepository<Table> _table;
    public SectionService(IGenericRepository<Section> section, IGenericRepository<Table> table)
    {
        _section = section;
        _table = table;
    }


    // index page get all section service
    public async Task<SectionsHelperViewModel> GetSectionsAsync(int? sectionId = null, string? searchTable = null, int pageNumber = 1, int pageSize = 5)
    {

        List<Section>? s = await _section.GetAllAsync();
        s = s.Where(u => u.Isdeleted == false).OrderBy(u => u.Sectionid).ToList();

        List<Table>? tables;
        if (sectionId.HasValue)
        {
            tables = await _table.GetTableBySectionIdAsync(sectionId);

        }
        else
        {
            tables = await _table.GetAllAsync();
        }
        tables = tables.Where(u => u.Isdeleted == false).OrderBy(u => u.Tableid).ToList();
        if (!string.IsNullOrEmpty(searchTable))
        {
            searchTable = searchTable.ToLower();
            tables = tables.Where(u => u.Tablename.ToLower().Contains(searchTable)).ToList();
        }
        int totalTales = tables.Count;
        tables = tables.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        SectionsHelperViewModel section = new SectionsHelperViewModel();
        section.Sections = s;
        section.Tables = tables;
        section.CurrentPage = pageNumber;
        section.PageSize = pageSize;
        section.TotalTables = totalTales;
        section.Sectionid = sectionId ?? 0;
        return section;
    }

    // index page add section service
    public async Task AddSectionService(SectionsHelperViewModel model)
    {
        Section section = new Section
        {
            Sectionname = model.Sectionname,
            Sectiondescription = model.Sectiondescription,
            Isdeleted = false,
            Createdat = DateTime.Now,
            Createdbyid = model.Userid,
            Editedat = DateTime.Now,
            Editedbyid = model.Userid
        };
        await _section.AddAsync(section);
    }

    // index page edit section service
    public async Task EditSectionService(SectionsHelperViewModel model)
    {
        Section? section = await _section.GetByIdAsync(model.Sectionid);
        if (section != null)
        {
            section.Sectiondescription = model.Sectiondescription;
            section.Sectionname = model.Sectionname;
            section.Editedat = DateTime.Now;
            section.Editedbyid = model.Userid;
            await _section.UpdateAsync(section);
        }

    }

    //index page delete section service
    public async Task<bool> DeleteSectionService(SectionsHelperViewModel model)
    {
        Section? section = await _section.GetByIdAsync(model.Sectionid);
        if (section == null)
        {
            return false; 
        }

        List<Table>? tables = await _table.GetTableBySectionIdAsync(model.Sectionid);
        if (tables != null && tables.Any(t => t.Status == 2 && t.Isdeleted == false))
        {
            return false; 
        }

        section.Isdeleted = true;
        section.Deletedat = DateTime.Now;
        section.Deletedbyid = model.Userid;
        await _section.UpdateAsync(section);

        if (tables != null)
        {
            foreach (var table in tables)
            {
                table.Isdeleted = true;
                table.Deletedat = DateTime.Now;
                table.Deletedbyid = model.Userid;
                await _table.UpdateAsync(table);
            }
        }

        return true; 
    }
  


  
    // table crud
    // add table service
    public async Task AddTableService(SectionsHelperViewModel model)
    {
        Table table = new Table
        {
            Sectionid = model.Sectionid,
            Tablename = model.Tablename,
            Capacity = model.Capacity ?? 0,
            Status = model.Status ?? 0,
            Isdeleted = false,
            Createdat = DateTime.Now,
            Createdbyid = model.Userid,
            Editedat = DateTime.Now,
            Editedbyid = model.Userid
        };
        await _table.AddAsync(table);
    }

    // delete table service
    public async Task<bool> DeleteTableService(int tableId, int userId)
    {
        Table? table = await _table.GetByIdAsync(tableId);
        if (table == null)
        {
            return false;
        }

        if (table.Status == 2)
        {
            return false;
        }

        table.Isdeleted = true;
        table.Deletedat = DateTime.Now;
        table.Deletedbyid = userId;
        await _table.UpdateAsync(table);
        return true; // Deletion successful
    }

    // edit table service
    public async Task EditTableService(SectionsHelperViewModel model)
    {
        Table? table = await _table.GetByIdAsync(model.Tableid);
        if (table != null)
        {
            table.Tablename = model.Tablename;
            table.Capacity = model.Capacity ?? 0;
            table.Status = model.Status ?? 0;
            table.Editedat = DateTime.Now;
            table.Editedbyid = model.Userid;
            await _table.UpdateAsync(table);
        }
    }
}
