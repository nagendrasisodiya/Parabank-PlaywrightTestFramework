import {test, expect} from '@playwright/test';
import {login} from "../../utils/login";
import {getAccounts} from "../../utils/getAccounts";

const correctCustomerId:number=12212
test('GET accounts returns error for a non-existent customer ID', async ({request}) => {
    // loging in user
    const userLoginResponse=await login(request, "john", "demo")
    const id=99999999
    const customerAccountResponse=await request.get(`https://parabank.parasoft.com/parabank/services/bank/customers/${id}/accounts`, {
        headers: {Accept:'application/json'}
    })
    expect(customerAccountResponse.status()).toBe(400)
});
test('GET accounts behavior when no auth credentials are provided', async ({request})=>{
    const customerAccountResponse=await request.get(`https://parabank.parasoft.com/parabank/services/bank/customers/${correctCustomerId}/accounts`, {
        headers: {Accept:'application/json'}
    })
    let accounts=await customerAccountResponse.json()
    console.log(accounts)
    expect(customerAccountResponse.status(), "api is returning 200 status code due to loose auth so, it is a security defect").not.toBe(200)
})