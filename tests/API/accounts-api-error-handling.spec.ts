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
test(' GET accounts with no auth credentials — API should reject but currently returns 200', async ({request})=>{
    const customerAccountResponse=await request.get(`https://parabank.parasoft.com/parabank/services/bank/customers/${correctCustomerId}/accounts`, {
        headers: {Accept:'application/json'}
    })
    if ( customerAccountResponse.status() === 200) {
        test.info().annotations.push({
            type: 'BUG CONFIRMED',
            description: `Security bug  present: Unauthenticated request was accepted with status 200. Expected 401/403.`
        })
    }else{
        test.info().annotations.push({
            type: 'NO BUG',
            description: ` Unauthenticated request was accepted with status 401/403.`
        })
    }
})