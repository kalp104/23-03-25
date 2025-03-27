using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using PizzaShop.Service.Interfaces;

namespace PizzaShop.Core.Filters;

public class AuthorizePermissionTax : ActionFilterAttribute
{
    private readonly IUserService _userService;

    public AuthorizePermissionTax(IUserService userService)
    {
        _userService = userService;
    }

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        string role = context.HttpContext.Items["UserRole"] as string ?? string.Empty;
        var rolefilter = await _userService.RoleFilter(role);

        if (rolefilter != null)
        {
            foreach (var i in rolefilter)
            {
                if (i.PermissionId == 5 && i.Canview == false)
                {
                    context.Result = new RedirectToActionResult("Privacy", "Home", null);
                    return;
                }
            }
        }
        await next();
    }
}
