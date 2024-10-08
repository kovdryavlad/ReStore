using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace API.Controllers;

public class BasketController : BaseApiController
{
    private readonly StoreContext _context;

    public BasketController(StoreContext context)
    {
        _context = context;
    }

    [HttpGet(Name = "GetBasket")]
    public async Task<ActionResult<BasketDto>> GetBasket()
    {
        var basket = await RetrieveBasket();

        if (basket is null)
        {
            return NotFound();
        }
        return MapBasketToDto(basket);
    }

    [HttpPost]
    public async Task<ActionResult<BasketDto>> AddItemToBasket(int productId, int quantity)
    {
        //get basket
        var basket = await RetrieveBasket();

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
            return CreatedAtRoute("GetBasket", MapBasketToDto(basket));
        }

        return BadRequest(new ProblemDetails(){Title = "Problem saving item to basket"});
    }

    [HttpDelete]
    public async Task<ActionResult> RemoveBasketItem(int productId, int quantity)
    {
        //get basket
        var basket = await RetrieveBasket();

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
        var buyerId = Guid.NewGuid().ToString();
        var cookieOptions = new CookieOptions
        {
            IsEssential = true,
            Expires = DateTime.Now.AddDays(30),
        };

        Response.Cookies.Append("buyerId", buyerId, cookieOptions);

        var basket = new Basket { BuyerId = buyerId };
        _context.Baskets.Add(basket);
        return basket;
    }

    private async Task<Basket> RetrieveBasket()
    {
        return await _context.Baskets
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.BuyerId == Request.Cookies["buyerId"]);
    }

    private static BasketDto MapBasketToDto(Basket basket)
    {
        return new BasketDto
        {
            Id = basket.Id,
            BuyerId = basket.BuyerId,
            Items = basket.Items.Select(x => new BasketItemDto
            {
                Id = x.Id,
                ProductId = x.ProductId,
                Name = x.Product.Name,
                Price = x.Product.Price,
                PictureUrl = x.Product.PictureUrl,
                Type = x.Product.Type,
                Brand = x.Product.Brand,
                Quantity = x.Quantity
            }).ToList()
        };
    }
}
