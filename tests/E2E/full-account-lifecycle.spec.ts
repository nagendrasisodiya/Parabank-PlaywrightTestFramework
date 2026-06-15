import {test, expect} from '@playwright/test';
// @ts-ignore
import fs from "node:fs";
import path = require("node:path");
import RegisterUserPage from "../../pages/register-user.page";
import {login} from "../../utils/login";
import AccountCreation from "../../pages/account-creation.page";
import {getAccounts} from "../../utils/getAccounts";
import FundTransfer from "../../pages/fund-transfer.page";

test('Full lifecycle — Register, Login, Create Account, Transfer, Validate via API', async ({page, request}) => {
    // reading user data json file
    const json_data: any = fs.readFileSync(path.join(__dirname, '../../test-data/userdata.json'))
    const userdata = JSON.parse(json_data)

    // creating unique username and password
    const suffix:string = `${Date.now()}`.slice(-5)
    let username:string = `${userdata.username}${suffix}`
    let password:string = `${userdata.password}${suffix}`

    // registering new user
    const regObj = new RegisterUserPage(page, userdata)
    await regObj.registerUser("https://parabank.parasoft.com", username, password)
    const regmsg:string=await regObj.successMsg()
    expect(regmsg).toContain('Your account was created successfully. You are now logged in.')

    // fetching customer id via login api
    const loginResponse=await login(request, username, password)
    const customerId:number=loginResponse.id

    // opening a new account
    const accountType:string="CHECKING"
    let accountCreationObj:AccountCreation=new AccountCreation(page)
    let newAccountNo:number=await accountCreationObj.openNewAccount(accountType)
    let newaccmsg=await accountCreationObj.captureConformationMsg()
    let time=new Date().getTime()
    await page.screenshot({path:`D:/CapstoneProject/Parabank/screenshots/full-account-lefecycle-e2e${time}.png`})
    expect(newaccmsg).toContain('Congratulations, your account is now open.');

    // verifying new account persent in api response
    const accountsResponse=await getAccounts(request, customerId)
    const accountNo_01:string=accountsResponse[0].id.toString()
    const account_02:string=accountsResponse[1].id.toString()
    let flag:boolean=false
    for(let i=0;i<accountsResponse.length;i++){
        if(accountsResponse[i].id===newAccountNo){
            flag=true
            break
        }
    }
    expect(flag).toBe(true)

    //transferring fund account_01 to account_02
    const fundTransferObj :FundTransfer= new FundTransfer(page)
    await fundTransferObj.transferFund("100", accountNo_01, account_02)
    await fundTransferObj.verifyFundTransfer("$100.00", accountNo_01, account_02)

    time=new Date().getTime()
    await page.screenshot({path:`D:/CapstoneProject/Parabank/screenshots/full-account-lefecycle-e2e${time}.png`})

    // verifying balance is being updated successfully
    let response_01=await request.get(`https://parabank.parasoft.com/parabank/services/bank/accounts/${accountNo_01}`, {
        headers:{Accept:'application/json'}
    })
    expect(response_01.status()).toBe(200)
    let response_02=await request.get(`https://parabank.parasoft.com/parabank/services/bank/accounts/${account_02}`, {
        headers:{Accept:'application/json'}
    })
    expect(response_02.status()).toBe(200)
    // verifying source account balance after transaction
    let body_01= await response_01.json()
    expect(accountsResponse[0].balance).toBe(body_01.balance+100)
    // account_02 current balance
    let body_02=await response_02.json()
    expect(accountsResponse[1].balance).toBe(body_02.balance-100)

    // loging-out from account
    await regObj.logOutUser()

});