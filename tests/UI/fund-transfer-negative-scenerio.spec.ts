import {test, expect, Page} from '@playwright/test';
// @ts-ignore
import fs from "node:fs";
import RegisterUserPage from "../../pages/register-user.page";
import path = require("node:path");
import LoginUser from "../../pages/login.page";
import AccountCreation from "../../pages/account-creation.page";
import FundTransfer from "../../pages/fund-transfer.page";
import {login} from "../../utils/login";
import {getAccounts} from "../../utils/getAccounts";


// shared state across all tests
let username: string
let password: string
let accountNo_01: string
let accountNo_02: string
test.beforeAll(async ({ browser, browserName, request}) => {
    const json_data: any = fs.readFileSync(path.join(__dirname, '../../test-data/userdata.json'))
    const userdata = JSON.parse(json_data)

    const suffix = `${Date.now()}`.slice(-5) + browserName[0]
    username = `${userdata.username}${suffix}`
    password = `${userdata.password}${suffix}`

    const context = await browser.newContext()
    let page:Page = await context.newPage()

    const regObj = new RegisterUserPage(page, userdata)
    await regObj.registerUser("https://parabank.parasoft.com", username, password)

    // creating new account
    const accountCreationObj:AccountCreation = new AccountCreation(page)
    await accountCreationObj.openNewAccount("Savings")

    // fetching account_id from accounts api
    const refreshedData = await login(request, username, password)
    const accounts = await getAccounts(request, refreshedData.id)
    accountNo_01 = accounts[0].id.toString()
    accountNo_02 = accounts[1].id.toString()

    // loging out user
    await regObj.logOutUser()
    await page.close()
    await context.close()
})
test("Transfer rejected when amount is zero", async ({page, request})=>{
    test.fail(true, "Bug: App should reject zero amount but currently accepts it")
    const loginObj:LoginUser = new LoginUser(page)
    const fundTransferObj:FundTransfer = new FundTransfer(page)

    await loginObj.login("https://parabank.parasoft.com", username, password)
    await fundTransferObj.transferFund("0", accountNo_01, accountNo_02)
})
test('Transfer rejected when amount is negative', async({page})=>{
    test.fail(true, "Bug: App should reject negative amount but currently accepts it")
    const loginObj:LoginUser = new LoginUser(page)
    const fundTransferObj:FundTransfer = new FundTransfer(page)

    await loginObj.login("https://parabank.parasoft.com", username, password)
    await fundTransferObj.transferFund("-1", accountNo_01, accountNo_02)

})

test('Transfer rejected when amount is non-numeric', async ({page})=>{
    const loginObj:LoginUser = new LoginUser(page)
    const fundTransferObj:FundTransfer = new FundTransfer(page)

    await loginObj.login("https://parabank.parasoft.com", username, password)
    await fundTransferObj.transferFund("X", accountNo_01, accountNo_02)
})
