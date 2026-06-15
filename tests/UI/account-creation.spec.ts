import {test, expect, Page} from '@playwright/test';
import AccountCreation from "../../pages/account-creation.page";
// @ts-ignore
import fs from "node:fs";
import path = require("node:path");
import LoginUser from "../../pages/login.page";
import RegisterUserPage from "../../pages/register-user.page";
import loginPage from "../../pages/login.page";
import {login} from "../../utils/login";
import {getAccounts} from "../../utils/getAccounts";


 test.describe.serial('account creation and verifying', ()=>{
     // shared state across all tests
     let newAccountNo:number
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
    // creating a new checking account UI
     test("Create a new CHECKING account via UI and capture account ID", async ({page})=>{
         let accountType:string="CHECKING"
         let loginObj:LoginUser=new LoginUser(page)
         let accountCreationObj:AccountCreation=new AccountCreation(page)
         // loging in
         await loginObj.login("https://parabank.parasoft.com", username, password)
         // creating new CHECKING account
         newAccountNo=await accountCreationObj.openNewAccount(accountType)
         let time=new Date().getTime()
         await page.screenshot({path:`D:/CapstoneProject/Parabank/screenshots/account-creation-UI${time}.png`})
         // console.log(newAccountNo)
     })

    // verifying new account exist in api response
     test("Verify newly created account exists in GET accounts API", async ({request})=>{
         const loginResponse=await login(request, username, password)
         const accountsResponse=await getAccounts(request, loginResponse.id)
         let flag:boolean=false
         for(let i=0;i<accountsResponse.length;i++){
             if(accountsResponse[i].id===newAccountNo){
                 flag=true
                 break
             }
         }
         expect(flag).toBe(true)
     })

 })