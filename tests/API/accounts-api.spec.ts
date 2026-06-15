import {test, expect, Page} from '@playwright/test';
import path = require("node:path");
// @ts-ignore
import fs from "node:fs";
import {login} from "../../utils/login";
import {getAccounts} from "../../utils/getAccounts";
import RegisterUserPage from "../../pages/register-user.page";

let username:string
let password:string
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
    await regObj.logOutUser()

    await page.close()
    await context.close()
})
test('GET accounts returns 200 with valid customer ID', async ({request}) => {
    // loging in user
    const userLoginResponse=await login(request, username, password)
    // fetching accounts linked to customer
    let accountsData=await getAccounts(request, userLoginResponse.id)
    
});