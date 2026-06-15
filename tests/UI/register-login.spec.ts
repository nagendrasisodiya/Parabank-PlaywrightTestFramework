import {Page, test} from '@playwright/test';
import RegisterUserPage from "../../pages/register-user.page";
// @ts-ignore
import fs from "node:fs";
import path = require("node:path");
import LoginUser from "../../pages/login.page";


let json_data:any=fs.readFileSync(path.join(__dirname, '../../test-data/userdata.json'))
let data=JSON.parse(json_data)

test('Register a new user with valid details', async ({browser, browserName}) => {
    const json_data: any = fs.readFileSync(path.join(__dirname, '../../test-data/userdata.json'))
    const userdata = JSON.parse(json_data)

    const suffix = `${Date.now()}`.slice(-5) + browserName[0]
    let username = `${userdata.username}${suffix}`
    let password = `${userdata.password}${suffix}`

    const context = await browser.newContext()
    let page:Page = await context.newPage()

    const regObj = new RegisterUserPage(page, userdata)
    await regObj.registerUser("https://parabank.parasoft.com", username, password)

    let time=new Date().getTime()
    await page.screenshot({path:`D:/CapstoneProject/Parabank/screenshots/register-login-UI${time}.png`})

    await regObj.logOutUser()
});

test('Login with valid registered credentials', async ({page})=>{
    let loginObj:LoginUser=new LoginUser(page)
    await loginObj.login("https://parabank.parasoft.com", "john", "demo")
    let time=new Date().getTime()
    await page.screenshot({path:`D:/CapstoneProject/Parabank/screenshots/register-login-UI${time}.png`})
})
