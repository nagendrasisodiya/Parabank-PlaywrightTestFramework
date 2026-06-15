import {test, expect, Page} from '@playwright/test';
// @ts-ignore
import fs from "node:fs";
import RegisterUserPage from "../../pages/register-user.page";
import path = require("node:path");
import LoginUser from "../../pages/login.page";
import AccountCreation from "../../pages/account-creation.page";
import {getAccounts} from "../../utils/getAccounts";
import {login} from "../../utils/login";

let username:string
let password:string
const accountType:string="SAVINGS"
let newAccountId:number
// insuring user already exist before executing any test
test.beforeAll(async ({ browser, browserName }) => {
    const json_data: any = fs.readFileSync(path.join(__dirname, '../../test-data/userdata.json'))
    const userdata = JSON.parse(json_data)

    const suffix = `${Date.now()}`.slice(-5) + browserName[0]
    username = `${userdata.username}${suffix}`
    password = `${userdata.password}${suffix}`

    const context = await browser.newContext()
    let page:Page = await context.newPage()

    const regObj = new RegisterUserPage(page, userdata)
    await regObj.registerUser("https://parabank.parasoft.com", username, password)

    // creating a new account to check for api response
    let accountCreationObj:AccountCreation=new AccountCreation(page)
    newAccountId=await accountCreationObj.openNewAccount(accountType)

    await regObj.logOutUser()

    await page.close()
    await context.close()
})
test('Validate account type in API matches type selected in UI', async ({request})=>{
    // loging in user
    const loginResponse=await login(request, username, password)
    // fetching account from accounts api
    const response=await request.get(`https://parabank.parasoft.com/parabank/services/bank/accounts/${newAccountId}`, {
        headers: {Accept:'application/json'}
    })
    expect(response.status()).toBe(200)
    let accountDetails=await response.json()
    expect(accountDetails.type).toBe("SAVINGS")

})
test('Validate all required account fields are present and valid in API response', async ({request})=>{
    const loginResponse=await login(request, username, password)
    // fetching accounts linked to customer
    const accountsResponse=await getAccounts(request, loginResponse.id)

    for(let account of accountsResponse){
        expect(account, 'account api response missing id field').toHaveProperty('id')
        expect(account, 'account api response missing customerId field').toHaveProperty('customerId')
        expect(account, 'account api response missing type field').toHaveProperty('type')
        expect(account, 'account api response missing balance field').toHaveProperty('balance')

        expect(typeof(account.id), 'id field should be type number').toBe('number')
        expect(typeof (account.customerId), 'customerId field should be type number').toBe('number')
        expect(typeof (account.type), 'type field should be type string').toBe('string')
        expect(typeof (account.balance), `'balance' should be a number`).toBe('number')
    }
})