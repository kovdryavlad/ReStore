using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using API.Controllers.Services;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Controllers;

public class BasketController : BaseApiController
{
    private readonly StoreContext _context;
    private readonly BasketService _basketService;

    public BasketController(StoreContext context, BasketService basketService)
    {
        _context = context;
        _basketService = basketService;
    }

    [HttpGet(Name = "GetBasket")]
    public async Task<ActionResult<BasketDto>> GetBasket()
    {
        var basket = await _basketService.RetrieveBasket(GetUserId());

        if (basket is null)
        {
            return NotFound();
        }
        return basket.MapBasketToDto();
    }

    [HttpPost]
    public async Task<ActionResult<BasketDto>> AddItemToBasket(int productId, int quantity)
    {
        //get basket
        var basket = await _basketService.RetrieveBasket(GetUserId());

        //create basket
        if(basket is null)
        {
            basket = CreateBasket();
        }

        //get product
        var product = await _context.Products.FirstOrDefaultAsync(x => x.Id == productId);

        if (product is null)
        {
            return BadRequest(new ProblemDetails { Title = "Product not found" });
        }

        //add item
        basket.AddItem(product, quantity);

        //save changes
        var result = await _context.SaveChangesAsync() > 0;

        if(result)
        {
            return CreatedAtRoute("GetBasket", basket.MapBasketToDto());
        }

        return BadRequest(new ProblemDetails(){Title = "Problem saving item to basket"});
    }

    [HttpDelete]
    public async Task<ActionResult> RemoveBasketItem(int productId, int quantity)
    {
        //get basket
        var basket = await _basketService.RetrieveBasket(GetUserId());

        if(basket is null)
        {
            return BadRequest(new ProblemDetails(){Title = "Basket is not found"});
        }

        //remove item or reduce quantity
        var product = _context.Products.FirstOrDefault(x => x.Id == productId);
        if(product is null)
        {
            return BadRequest(new ProblemDetails() { Title = "Product is not found" });
        }

        basket.RemoveItem(product, quantity);

        //save changes
        var result = await _context.SaveChangesAsync() > 0;
        
        if(result)
        {
            return Ok();
        }
        
        return BadRequest(new ProblemDetails(){Title = "Problem removing item from basket"});
    }


    private Basket CreateBasket()
    {
        var buyerId = User.Identity?.Name;
        if (string.IsNullOrWhiteSpace(buyerId))
        {
            buyerId = Guid.NewGuid().ToString();

            var cookieOptions = new CookieOptions
            {
                IsEssential = true,
                Expires = DateTime.Now.AddDays(30),
            };

            Response.Cookies.Append("buyerId", buyerId, cookieOptions);
        }

        var basket = new Basket { BuyerId = buyerId };
        _context.Baskets.Add(basket);
        return basket;
    }

    private string GetUserId()
    {
        return User.Identity?.Name ?? Request.Cookies["buyerId"];
    }
}
