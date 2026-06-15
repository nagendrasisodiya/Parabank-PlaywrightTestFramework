import {expect, Locator, Page} from "@playwright/test";

class LoginUser{
    page:Page
    // user credentials input fields
    username:Locator
    password:Locator
    // loging btn
    loginBTN:Locator
    // success message
    loginSuccessMsg:Locator
    // failure message
    failureMsg:Locator
    constructor(page:Page) {
        this.page=page

        this.username=page.locator('//input[@name="username"]')
        this.password=page.locator('//input[@name="password"]')

        this.loginBTN=page.getByRole('button', {name:'Log In'})

        this.loginSuccessMsg=page.locator('//p[@class="smallText"]/b')

        this.failureMsg=page.locator('#rightPanel > p')
    }

    async login(webUrl:string, username:string, password:string){
        await this.page.goto(webUrl)
        await this.page.waitForLoadState('networkidle')

        await this.username.fill(username)
        await this.password.fill(password)
        await this.loginBTN.click()

        await this.page.waitForLoadState('networkidle')
        await expect(this.loginSuccessMsg).toHaveText('Welcome')
    }
    // for negative test cases
    async attemptLogin(webUrl:string, username:string, password:string){
        await this.page.goto(webUrl)
        await this.page.waitForLoadState('networkidle')

        await this.username.fill(username)
        await this.password.fill(password)
        await this.loginBTN.click()

        await this.page.waitForLoadState('networkidle')
    }
    // for empty username password filed test
    async emptyAttemptLogin(webUrl:string){
        await this.page.goto(webUrl)
        await this.loginBTN.click()

        await this.page.waitForLoadState('domcontentloaded')
    }
    async captureFailureMsg(){
        await this.page.waitForTimeout(5000)
        return  this.failureMsg.innerText()
    }
}export default LoginUser