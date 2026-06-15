import {test, expect, Page} from '@playwright/test';
// @ts-ignore
import fs from "node:fs";
import RegisterUserPage from "../../pages/register-user.page";
import path = require("node:path");
import {login} from "../../utils/login";
import {getAccounts} from "../../utils/getAccounts";
import AccountCreation from "../../pages/account-creation.page";
import LoginUser from "../../pages/login.page";
import FundTransfer from "../../pages/fund-transfer.page";


test.describe.serial("Validate Before/After Balances on Fund Transfer", ()=>{
    // shared state across all tests
    let username: string
    let password: string
    let sourceAccount: string
    let destinationAccount: string
    // account balance before transaction
    let balanceSourceAccount:number
    let balanceDestinationAccount:number
    // amount to be transfer
    const amount: string = "50"

    test.beforeAll(async ({ browser, browserName }) => {
        const json_data: any = fs.readFileSync(path.join(__dirname, '../../test-data/userdata.json'))
        const userdata = JSON.parse(json_data)

        const suffix:string = `${Date.now()}`.slice(-5) + browserName[0]
        username = `${userdata.username}${suffix}`
        password = `${userdata.password}${suffix}`

        const context = await browser.newContext()
        let page = await context.newPage()

        const regObj = new RegisterUserPage(page, userdata)
        await regObj.registerUser("https://parabank.parasoft.com", username, password)
        // creating new account
        const accountCreationObj:AccountCreation = new AccountCreation(page)
        await accountCreationObj.openNewAccount("Savings")

        await regObj.logOutUser()

        await page.close()
        await context.close()
    })

    test("Capture before-transfer balances via API for both accounts", async ({request})=>{
        const loginResponse = await login(request, username, password)
        const accounts = await getAccounts(request, loginResponse.id)
        sourceAccount = accounts[0].id.toString()
        destinationAccount = accounts[1].id.toString()
        let response_01=await request.get(`https://parabank.parasoft.com/parabank/services/bank/accounts/${sourceAccount}`, {
            headers:{Accept:'application/json'}
        })
        expect(response_01.status()).toBe(200)
        let response_02=await request.get(`https://parabank.parasoft.com/parabank/services/bank/accounts/${destinationAccount}`, {
            headers:{Accept:'application/json'}
        })
        expect(response_02.status()).toBe(200)
        // source account current balance
        let body_01= await response_01.json()
        balanceSourceAccount=body_01.balance
        // console.log(balanceSourceAccount)
        // destination account current balance
        let body_02=await response_02.json()
        balanceDestinationAccount=body_02.balance
        // console.log(balanceDestinationAccount)
    })

    test("Validate exact debit and credit amounts in API after transfer", async ({page, request})=>{
        // fund transfer UI
        const loginObj:LoginUser = new LoginUser(page)
        const fundTransferObj:FundTransfer = new FundTransfer(page)
        await loginObj.login("https://parabank.parasoft.com", username, password)
        await fundTransferObj.transferFund(amount, sourceAccount, destinationAccount)
        await fundTransferObj.transferStatus()
        // account balance fetching after transaction API
        const loginResponse = await login(request, username, password)
        let response_01=await request.get(`https://parabank.parasoft.com/parabank/services/bank/accounts/${sourceAccount}`, {
            headers:{Accept:'application/json'}
        })
        expect(response_01.status()).toBe(200)
        let response_02=await request.get(`https://parabank.parasoft.com/parabank/services/bank/accounts/${destinationAccount}`, {
            headers:{Accept:'application/json'}
        })
        expect(response_02.status()).toBe(200)
        // verifying source account balance after transaction
        let body_01= await response_01.json()
        expect(balanceSourceAccount).toBe(body_01.balance+Number(amount))
        // account_02 current balance
        let body_02=await response_02.json()
        expect(balanceDestinationAccount).toBe(body_02.balance-Number(amount))
    })
})