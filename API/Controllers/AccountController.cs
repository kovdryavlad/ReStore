using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Controllers.Services;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class AccountController : BaseApiController
{
    private readonly UserManager<User> _userManager;
    private readonly TokenService _tokenService;
    private readonly BasketService _basketService;
    private readonly StoreContext _storeContext;

    public AccountController(UserManager<User> userManager, 
        TokenService tokenService,
        BasketService basketService,
        StoreContext storeContext)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _basketService = basketService;
        _storeContext = storeContext;
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await _userManager.FindByNameAsync(loginDto.Username);

        if(user == null || !await _userManager.CheckPasswordAsync(user, loginDto.Password))
        {
            return Unauthorized();
        }

        var userBasket = await _basketService.RetrieveBasket(loginDto.Username);
        var anonBasket = await _basketService.RetrieveBasket(Request.Cookies["buyerId"]);

        if(anonBasket != null)
        {
            if(userBasket != null)
            {
                _storeContext.Baskets.Remove(userBasket);
            }

            anonBasket.BuyerId = user.UserName;
            Response.Cookies.Delete("buyerId");
            await _storeContext.SaveChangesAsync();
        }

        return new UserDto()
        {
            Email = user.Email,
            Token = await _tokenService.GenerateToken(user),
            Basket = (anonBasket ?? userBasket)?.MapBasketToDto(),
        };
    }

    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(RegisterDto registerDto)
    {
        var user = new User
        {
            UserName = registerDto.Username,
            Email = registerDto.Email,
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);

        if(!result.Succeeded)
        {
            foreach(var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }

            return ValidationProblem();
        }

        await _userManager.AddToRoleAsync(user, "Member");
        
        return StatusCode(201);
    }

    [Authorize]
    [HttpGet("currentUser")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var user = await _userManager.FindByNameAsync(User.Identity.Name);
        
        var userBasket = await _basketService.RetrieveBasket(User.Identity.Name);

        return new UserDto()
        {
            Email = user.Email,
            Token = await _tokenService.GenerateToken(user),
            Basket = userBasket?.MapBasketToDto(),
        };
    }
}
