import {test, expect} from '@playwright/test';
import RegisterUserPage from "../../pages/register-user.page";
// @ts-ignore
import fs from "node:fs";
import path = require("node:path");
import {login} from "../../utils/login";
import AccountCreation from "../../pages/account-creation.page";
import {getAccounts} from "../../utils/getAccounts";
import FundTransfer from "../../pages/fund-transfer.page";

test('Sequential transfers — validate running balance integrity across two consecutive transfers', async ({page, request, browserName}) => {
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

    let time=new Date().getTime()
    await page.screenshot({path:`D:/CapstoneProject/Parabank/screenshots/sequential-fund-transfers-e2e${time}.png`})

    // fetching customer id via login api
    const loginResponse=await login(request, username, password)
    const customerId:number=loginResponse.id

    // opening a new accounts
    let accountCreationObj:AccountCreation=new AccountCreation(page)
    await accountCreationObj.openNewAccount("SAVING")
    await accountCreationObj.openNewAccount("CHECKING")

    // fetching accounts from api
    const accountsResponse=await getAccounts(request, customerId)
    const accountNo_01_id:string=accountsResponse[0].id.toString()
    const accountNo_02_id:string=accountsResponse[1].id.toString()
    const accountNo_03_id:string=accountsResponse[2].id.toString()


    //transferring fund account_01 to account_02
    const fundTransferObj :FundTransfer= new FundTransfer(page)
    await fundTransferObj.transferFund("100", accountNo_01_id, accountNo_02_id)
    await fundTransferObj.verifyFundTransfer("$100.00", accountNo_01_id, accountNo_02_id)

    // fetching account details from api individually after transaction
    const account_01_mid_response=await request.get(`https://parabank.parasoft.com/parabank/services/bank/accounts/${accountNo_01_id}`, {
        headers:{Accept:'application/json'}
    })
    expect(account_01_mid_response.status()).toBe(200)
    const account_02_mid_response=await request.get(`https://parabank.parasoft.com/parabank/services/bank/accounts/${accountNo_02_id}`, {
        headers:{Accept:'application/json'}
    })
    // verifying source account balance after transaction
    let account_01_mid= await account_01_mid_response.json()
    expect(accountsResponse[0].balance).toBe(account_01_mid.balance+100)
    // account_02 current balance
    let account_02_mid=await account_02_mid_response.json()
    expect(accountsResponse[1].balance).toBe(account_02_mid.balance-100)


    //transferring fund account_02 to account_03
    await fundTransferObj.transferFund("100", accountNo_02_id, accountNo_03_id)
    await fundTransferObj.verifyFundTransfer("$100.00", accountNo_02_id, accountNo_03_id)

    // fetching account details from api individually after transaction for (account_02 last transaction) and (account_03 mid transaction)
    const account_02_last_response=await request.get(`https://parabank.parasoft.com/parabank/services/bank/accounts/${accountNo_02_id}`, {
        headers:{Accept:'application/json'}
    })
    expect(account_02_last_response.status()).toBe(200)
    const account_03_mid_response=await request.get(`https://parabank.parasoft.com/parabank/services/bank/accounts/${accountNo_03_id}`, {
        headers:{Accept:'application/json'}
    })
    // verifying source account balance after transaction
    let account_02_last= await account_02_last_response.json()
    expect(account_02_mid.balance).toBe(account_02_last.balance+100)
    // account_02 current balance
    let account_03_mid=await account_03_mid_response.json()
    expect(accountsResponse[2].balance).toBe(account_03_mid.balance-100)


    //transferring fund account_03 to account_01
    await fundTransferObj.transferFund("100", accountNo_03_id, accountNo_01_id)
    await fundTransferObj.verifyFundTransfer("$100.00", accountNo_03_id, accountNo_01_id)

    // fetching account details from api individually after transaction for (account_02 last transaction) and (account_03 mid transaction)
    const account_03_last_response=await request.get(`https://parabank.parasoft.com/parabank/services/bank/accounts/${accountNo_03_id}`, {
        headers:{Accept:'application/json'}
    })
    expect(account_03_last_response.status()).toBe(200)
    const account_01_last_response=await request.get(`https://parabank.parasoft.com/parabank/services/bank/accounts/${accountNo_01_id}`, {
        headers:{Accept:'application/json'}
    })
    // verifying source account balance after transaction
    let account_03_last= await account_03_last_response.json()
    expect(account_03_last.balance).toBe(account_03_mid.balance-100)
    // account_02 current balance
    let account_01_last=await account_01_last_response.json()
    expect(account_01_last.balance).toBe(account_01_mid.balance+100)

    // loging-out from account
    await regObj.logOutUser()
});