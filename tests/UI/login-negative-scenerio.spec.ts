import {test, expect, Page} from '@playwright/test';
import LoginUser from "../../pages/login.page";


test("Login rejected with completely incorrect credentials", async ({page})=>{
    let loginObj:LoginUser=new LoginUser(page)
    let invalidUser:string="Invaliduser0044"
    let invalidPassword:string="InavlidPass0014"

    await loginObj.attemptLogin("https://parabank.parasoft.com", invalidUser, invalidPassword)

    let failureMessage:string= await loginObj.captureFailureMsg()
    expect(failureMessage).toContain("The username and password could not be verified.")
})
test("Login rejected with valid username but wrong password", async ({page})=>{
    let loginObj:LoginUser=new LoginUser(page)
    let invalidUser:string="john"
    let invalidPassword:string="1234"

    await loginObj.attemptLogin("https://parabank.parasoft.com", invalidUser, invalidPassword)

    let failureMessage:string= await loginObj.captureFailureMsg()
    expect(failureMessage).toContain("The username and password could not be verified.")
})

test("Login rejected when both username and password fields are empty", async ({page})=>{
    let loginObj:LoginUser=new LoginUser(page)

    await loginObj.emptyAttemptLogin("https://parabank.parasoft.com")

    let failureMessage:string= await loginObj.captureFailureMsg()
    expect(failureMessage).toContain("Please enter a username and password.")
})
