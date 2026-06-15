import {test, expect, Page} from '@playwright/test';
// @ts-ignore
import fs from "node:fs";
import path = require("node:path");
import FundTransfer from "../../pages/fund-transfer.page";
import LoginUser from "../../pages/login.page";
import RegisterUserPage from "../../pages/register-user.page";
import AccountCreation from "../../pages/account-creation.page";
import {getAccounts} from "../../utils/getAccounts";
import {login} from "../../utils/login";




test.describe.serial("Transfer Funds Successfully Between Accounts", () => {
    // shared state across all tests
    let username: string
    let password: string
    let page: Page
    let accountNo_01: string
    let accountNo_02: string

    const inputAmount: string = "100"
    const displayAmount: string = "$100.00"

    test.beforeAll(async ({ browser, browserName }) => {
        const json_data: any = fs.readFileSync(path.join(__dirname, '../../test-data/userdata.json'))
        const userdata = JSON.parse(json_data)

        const suffix = `${Date.now()}`.slice(-5) + browserName[0]
        username = `${userdata.username}${suffix}`
        password = `${userdata.password}${suffix}`

        const context = await browser.newContext()
        page = await context.newPage()

        const regObj = new RegisterUserPage(page, userdata)
        await regObj.registerUser("https://parabank.parasoft.com", username, password)
        await regObj.logOutUser()
    })

    test('Transfer a valid amount between two accounts via UI', async ({ request }) => {
        const loginObj = new LoginUser(page)
        const accountCreationObj = new AccountCreation(page)
        const fundTransferObj = new FundTransfer(page)

        await loginObj.login("https://parabank.parasoft.com", username, password)
        await accountCreationObj.openNewAccount("Savings")

        const refreshedData = await login(request, username, password)
        const accounts = await getAccounts(request, refreshedData.id)
        accountNo_01 = accounts[0].id.toString()
        accountNo_02 = accounts[1].id.toString()

        await fundTransferObj.transferFund(inputAmount, accountNo_01, accountNo_02)
        await fundTransferObj.transferStatus()

        let time=new Date().getTime()
        await page.screenshot({path:`D:/CapstoneProject/Parabank/screenshots/fund-transfer-UI${time}.png`})
    })

    test('Verify transfer confirmation details match entered input', async () => {
        const fundTransferObj = new FundTransfer(page)
        await fundTransferObj.verifyFundTransfer(displayAmount, accountNo_01, accountNo_02)
    })

})


