using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Controllers.Services;
using API.Data;
using API.DTOs;
using API.Entities.OrderAggregate;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Headers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace API.Controllers;

public class PaymentsController : BaseApiController
{
    private readonly PaymentService _paymentService;
    private readonly StoreContext _storeContext;
    private readonly BasketService _basketService;
    private readonly IConfiguration _config;

    public PaymentsController(
        PaymentService paymentService, 
        StoreContext storeContext,
        BasketService basketService,
        IConfiguration config)
    {
        _paymentService = paymentService;
        _storeContext = storeContext;
        _basketService = basketService;
        _config = config;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<BasketDto>> CreateOrUpdatePaymentIntent()
    {
        var basket = await _basketService
            .RetrieveBasket(User.Identity.Name);

        if(basket == null)
        {
            return NotFound();
        }

        var intent = await _paymentService.CreateOrUpdatePaymentIntent(basket);

        if (intent == null)
        {
            return BadRequest(new ProblemDetails(){Title = "Problem creating payment intent"});
        }
        
        basket.PaymentIntentId ??= intent.Id;
        basket.ClientSecret ??= intent.ClientSecret;

        _storeContext.Update(basket);

        var result = await _storeContext.SaveChangesAsync() > 0;

        if(!result)
        {
            return BadRequest(new ProblemDetails(){Title = "Problem updating busket with intent id and client secret"});
        }

        return basket.MapBasketToDto();
    }

    [HttpPost("webhook")]
    public async Task<ActionResult> StripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        
        var stripeEvent = EventUtility.ConstructEvent(json, 
            Request.Headers["Stripe-Signature"],
            _config["StripeSettings:WhSecret"]);
        
        var charge = (Charge)stripeEvent.Data.Object;

        var order = await _storeContext.Orders.FirstOrDefaultAsync(x => 
            x.PaymentIntentId == charge.PaymentIntentId);

        if(charge.Status == "succeeded")
        {
            order.OrderStatus = OrderStatus.PaymentReceived;
        }

        await _storeContext.SaveChangesAsync();

        return new EmptyResult();
    }
}
