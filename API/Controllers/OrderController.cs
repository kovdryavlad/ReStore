using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Controllers.Services;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Entities.OrderAggregate;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class OrderController : BaseApiController
{
    private readonly StoreContext _storeContext;
    private readonly BasketService _basketService;

    public OrderController(StoreContext storeContext, BasketService basketService)
    {
        _storeContext = storeContext;
        _basketService = basketService;
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetOrders()
    {
        return await _storeContext.Orders
            .Where(x => x.BuyerId == User.Identity.Name)
            .ProjectOrderToOrderDto()
            .ToListAsync();
    }

    [HttpGet("{id}", Name = "GetOrder")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        return await _storeContext.Orders
            .Where(x => x.BuyerId == User.Identity.Name && x.Id == id)
            .ProjectOrderToOrderDto()
            .FirstOrDefaultAsync();
    }

    [HttpPost]
    public async Task<ActionResult> CreateOrder(CreateOrderDto orderDto)
    {
        var basket = await _basketService.RetrieveBasket(User.Identity.Name);

        if(basket is null)
        {
            return BadRequest(new ProblemDetails(){Title="Could not locate basket"});
        }
        
        var items = new List<OrderItem>();

        foreach(var item in basket.Items)
        {
            var productItem = await _storeContext.Products.FindAsync(item.ProductId);

            var itemOrdered = new ProductItemOrdered
            {
                ProductId = productItem.Id,
                Name = productItem.Name,
                PictureUrl = productItem.PictureUrl,
            };

            var orderItem = new OrderItem
            {
                ItemOrdered = itemOrdered,
                Price = productItem.Price,
                Quantity = item.Quantity,
            };

            items.Add(orderItem);
            productItem.QuantityInStock -= item.Quantity;
        }

        var subtotal = items.Sum(item => item.Price * item.Quantity);
        var deliveryFee = subtotal > 10000 ? 0 : 500;
        var order = new Order()
        {
            OrderItems = items,
            BuyerId = User.Identity.Name,
            ShippingAddress = orderDto.ShippingAddress,
            DeliveryFee = deliveryFee,
            Subtotal = subtotal,
        };

        _storeContext.Orders.Add(order);
        _storeContext.Baskets.Remove(basket);

        if(orderDto.SaveAddress)
        {
            var user = await _storeContext.Users
                .Include(x => x.Address)
                .FirstOrDefaultAsync(x => x.UserName == User.Identity.Name);

            user.Address = new UserAddress()
            {
                FullName = orderDto.ShippingAddress.FullName,
                Address1 = orderDto.ShippingAddress.Address1,
                Address2 = orderDto.ShippingAddress.Address2,
                City = orderDto.ShippingAddress.City,
                State = orderDto.ShippingAddress.State,
                Zip = orderDto.ShippingAddress.Zip,
                Country = orderDto.ShippingAddress.Country,
            };
        }

        var result = await _storeContext.SaveChangesAsync() > 0;
        return result 
            ? CreatedAtRoute("GetOrder", new { id = order.Id }, order.Id) 
            : BadRequest(new ProblemDetails{Title = "Problem with creating the order"});
    }
}
