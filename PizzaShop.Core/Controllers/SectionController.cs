using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PizzaShop.Core.Filters;
using PizzaShop.Repository.Models;
using PizzaShop.Repository.ModelView;
using PizzaShop.Service.Interfaces;

namespace PizzaShop.Core.Controllers;

[Authorize]
[ServiceFilter(typeof(AuthorizePermissionSections))]
public class SectionController : Controller
{
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;
    private readonly IUserTableService _userTableService;
    private readonly IRoleService _roleService;
    private readonly ISectionService _sectionService;
    public SectionController(
        IUserTableService userTableService,
        IConfiguration configuration,
        IUserService userService,
        IRoleService roleService,
        ISectionService sectionService)
    {
        _configuration = configuration;
        _userService = userService;
        _userTableService = userTableService;
        _roleService = roleService;
        _sectionService = sectionService;
    }
    private async Task FetchData()
    {
        string email = HttpContext.Items["UserEmail"] as string ?? string.Empty;
        string role = HttpContext.Items["UserRole"] as string ?? string.Empty;
        UserBagViewModel? userBag = await _userService.UserDetailBag(email);
        List<RolePermissionModelView>? rolefilter = await _userService.RoleFilter(role);
        if (userBag != null)
        {
            ViewBag.Username = userBag.UserName;
            ViewBag.Userid = userBag.UserId;
            ViewBag.ImageUrl = userBag.ImageUrl;
            ViewBag.permission = rolefilter;
        }
    }


    // index of section and tables
    public async Task<IActionResult> Index(int? sectionId = null, string? searchTable = null, int pageNumber = 1, int pageSize = 5)
    {
        await FetchData();
        SectionsHelperViewModel section = await _sectionService.GetSectionsAsync(sectionId, searchTable, pageNumber, pageSize);
        ViewBag.SeclectedSectionId = section.Sectionid;
        return View(section);
    }


    // section crud
    [HttpPost]
    public async Task<IActionResult> AddSection(SectionsHelperViewModel model)
    {
        await FetchData();
        await _sectionService.AddSectionService(model);
        TempData["SectionSuccess"] = "Section added successfully";
        return RedirectToAction("Index");
    }

    [HttpPost]
    public async Task<IActionResult> EditSection(SectionsHelperViewModel model)
    {
        await FetchData();
        await _sectionService.EditSectionService(model);
        TempData["SectionSuccess"] = "Section Edited successfully";
        return RedirectToAction("Index");
    }

    [HttpPost]
    public async Task<IActionResult> DeleteSection(SectionsHelperViewModel model)
    {
        bool success = await _sectionService.DeleteSectionService(model);
        await FetchData();

        if (success)
        {
            TempData["SectionSuccess"] = "Section deleted successfully";
        }
        else
        {
            TempData["SectionError"] = "Cannot delete section because some tables are occupied.";
        }

        return RedirectToAction("Index");
    }



    // table crud
    public async Task<IActionResult> FilterTables(int? sectionId = null, string? searchTable = null, int pageNumber = 1, int pageSize = 5)
    {
        await FetchData();
        SectionsHelperViewModel section = await _sectionService.GetSectionsAsync(sectionId, searchTable, pageNumber, pageSize);
        ViewBag.SeclectedSectionId = section.Sectionid;
        return PartialView("_TablesPartial", section);
    }
    public async Task<IActionResult> AddTable(SectionsHelperViewModel model)
    {
        await FetchData();
        await _sectionService.AddTableService(model);
        TempData["SectionSuccess"] = "Table added successfully";
        return RedirectToAction("Index");
    }
    public async Task<IActionResult> DeleteTable(int Tableid)
    {
        await FetchData();
        int userid = ViewBag.Userid;
        bool success = await _sectionService.DeleteTableService(Tableid, userid);
        if (success)
        {
            TempData["SectionSuccess"] = "Table deleted successfully";
        }
        else
        {
            TempData["SectionError"] = "Cannot delete table because it is occupied.";
        }
        return RedirectToAction("Index");
    }
    public async Task<IActionResult> EditTable(SectionsHelperViewModel model)
    {
        await FetchData();
        await _sectionService.EditTableService(model);
        TempData["SectionSuccess"] = "Table edited successfully";
        return RedirectToAction("Index");
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteTables(string deleteSelectedTableIds)
    {
        await FetchData();
        int userid = ViewBag.Userid;

        if (string.IsNullOrEmpty(deleteSelectedTableIds))
        {
            TempData["SectionError"] = "No tables selected for deletion.";
            return RedirectToAction("Index");
        }

        List<int> tableIds = deleteSelectedTableIds.Split(',').Select(int.Parse).ToList();
        bool allDeleted = true;
        foreach (int tableId in tableIds)
        {
            bool success = await _sectionService.DeleteTableService(tableId, userid);
            if (!success)
            {
                allDeleted = false; // At least one table couldn’t be deleted
            }
        }

        if (allDeleted)
        {
            TempData["SectionSuccess"] = "Tables deleted successfully";
            return RedirectToAction("Index");
        }
        else
        {
            TempData["SectionError"] = "Some tables could not be deleted because they are occupied.";
            return RedirectToAction("Index");
        }

    }


}
