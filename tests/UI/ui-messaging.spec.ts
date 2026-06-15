import {test, expect, Page} from '@playwright/test';
// @ts-ignore
import fs from "node:fs";
import RegisterUserPage from "../../pages/register-user.page";
import path = require("node:path");
import LoginUser from "../../pages/login.page";
import AccountCreation from "../../pages/account-creation.page";

// shared state across all tests
let username:string
let password:string
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

    await regObj.logOutUser()

    await page.close()
    await context.close()
})

test("Validate success message displayed after account creation", async ({page})=>{
    let accountType:string="Saving"
    let loginObj:LoginUser=new LoginUser(page)
    let accountCreationObj:AccountCreation=new AccountCreation(page)
    // loging in
    await loginObj.login("https://parabank.parasoft.com", username, password)
    // creating new CHECKING account
    let accNo:number=await accountCreationObj.openNewAccount(accountType)
    let uiMsg:string=await accountCreationObj.captureConformationMsg()
    expect(uiMsg).toContain('Congratulations, your account is now open.');
    console.log(`New Account id: ${accNo}`)
    console.log(`success msg after new account creation: ${uiMsg}`)
})

