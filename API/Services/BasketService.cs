using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers.Services;

public class BasketService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly StoreContext _storeContext;

    public BasketService(
        IHttpContextAccessor httpContextAccessor, 
        StoreContext storeContext)
    {
        _httpContextAccessor = httpContextAccessor;
        _storeContext = storeContext;
    }

    public async Task<Basket> RetrieveBasket(string buyerId)
    {
        if (string.IsNullOrWhiteSpace(buyerId))
        {
            _httpContextAccessor.HttpContext.Response.Cookies.Delete("buyerId");
            return null;
        }

        return await _storeContext.Baskets
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.BuyerId == buyerId);
    }

}
