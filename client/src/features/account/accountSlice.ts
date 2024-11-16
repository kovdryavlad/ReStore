import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { User } from "../../app/models/user";
import agent from "../../app/api/agent";
import { FieldValues } from "react-hook-form";
import { router } from "../../app/router/Routes";
import { toast } from "react-toastify";
import { setBasket } from "../basket/basketSlice";

interface AccountSlice {
    user: User | null,   
}

const initialState: AccountSlice = {
    user: null,
}

export const signInUser = createAsyncThunk<User, FieldValues>(
    'account/signInUser',
    async (data, thunkAPI) => {
        try{
            const userDto = await agent.Account.login(data);
            const {basket, ...user} = userDto;
            if(basket)
            {
                thunkAPI.dispatch(setBasket(basket));
            }
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch(error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    } 
);

export const fetchCurrentUser = createAsyncThunk<User>(
    'account/fetchCurrentUser',
    async (_, thunkAPI) => {
        thunkAPI.dispatch(setUser(JSON.parse(localStorage.getItem('user')!)));

        try{
            const userDto = await agent.Account.currentUser();
            
            const {basket, ...user} = userDto;
            if(basket)
            {
                thunkAPI.dispatch(setBasket(basket));
            }
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch(error: any) {
            return thunkAPI.rejectWithValue({error: error.data})
        }
    },
    {
        condition: () => {
            if(!localStorage.getItem('user')){
                return false;
            }
        }
    }
);


export const accountSlice = createSlice({
    name: 'account',
    initialState, 
    reducers: {
        signOut: (state) => {
            state.user = null;
            localStorage.removeItem('user');
            router.navigate('/');
        },
        setUser: (state, action) => {
            state.user = createUserObject(action.payload);
        }
    },
    extraReducers: (builder => {
        builder.addCase(fetchCurrentUser.rejected, (state)=>{
            state.user = null;
            localStorage.removeItem('user');
            toast.error('Session expired - please login again');
            router.navigate('/');
        });

        builder.addMatcher(isAnyOf(signInUser.fulfilled, fetchCurrentUser.fulfilled), (state, action) => {
           state.user = createUserObject(action.payload);
        });
        builder.addMatcher(isAnyOf(signInUser.rejected), (_state, action:any) => {
            throw action.payload;
        });
    })
})

function createUserObject(fetchUserActionPayload: any){
    const claims = JSON.parse(atob(fetchUserActionPayload.token.split(".")[1]));
    const roles = claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    
    return {...fetchUserActionPayload, roles: (typeof(roles) === 'string' ? [roles] : roles)};
}

export const {signOut, setUser} = accountSlice.actions;