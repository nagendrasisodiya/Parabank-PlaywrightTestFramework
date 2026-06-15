import {expect, Locator, Page} from "@playwright/test";

class RegisterUserPage{
    page:Page
    data:any
    // leads to registration form
    registrationForm:Locator //an hyper-link

    //reg form input fields
    firstName:Locator
    lastName:Locator
    address:Locator
    city:Locator
    state:Locator
    zipCode:Locator
    phoneNo:Locator
    ssn:Locator
    userName:Locator
    password:Locator
    confirmPass:Locator

    // submit button
    registrationBTN:Locator
    // registration success msg
    regSuccessMsg:Locator
    successMSG:Locator
    // logout button
    logOutBTN:Locator
    constructor(page:Page, data:any) {
        this.page=page
        this.data=data

        this.registrationForm=page.getByRole('link', {name:'Register'})

        this.firstName=page.locator('//input[@id="customer.firstName"]')
        this.lastName=page.locator('//input[@id="customer.lastName"]')
        this.address=page.locator('//input[@id="customer.address.street"]')
        this.city=page.locator('//input[@id="customer.address.city"]')
        this.state=page.locator('//input[@id="customer.address.state"]')
        this.zipCode=page.locator('//input[@id="customer.address.zipCode"]')
        this.phoneNo=page.locator('#customer\\.phoneNumber')
        this.ssn=page.locator("#customer\\.ssn")
        this.userName=page.locator('#customer\\.username')
        this.password=page.locator('#customer\\.password')
        this.confirmPass=page.locator('#repeatedPassword')
        this.registrationBTN=page.getByRole('button', {name:'Register'})

        this.regSuccessMsg=page.locator('#rightPanel > h1')
        this.successMSG=page.locator('#rightPanel > p')

        this.logOutBTN=page.getByRole('link', {name:'Log Out'})
    }

    async registerUser(webUrl:string, username:string, password:string){
        await this.page.goto(webUrl)
        await this.page.waitForLoadState('networkidle')

        // goto reg form
        await this.registrationForm.click()

        // fill user data
        await this.firstName.fill(this.data.firstName)
        await this.lastName.fill(this.data.lastName)
        await this.address.fill(this.data.address.street)
        await this.city.fill(this.data.address.city)
        await this.state.fill(this.data.address.state)
        await this.zipCode.fill(this.data.address.zipCode)
        await this.phoneNo.fill(this.data.phoneNumber)
        await this.ssn.fill(this.data.ssn)
        await this.userName.fill(username)
        await this.password.fill(password)
        await this.confirmPass.fill(password)
        await this.registrationBTN.click()

        //
        await this.regSuccessMsg.waitFor({state: 'visible'})
        await expect(this.regSuccessMsg).toContainText(`Welcome ${username}`)
    }
    async logOutUser(){
        await this.logOutBTN.waitFor({state: 'visible'})
        await this.logOutBTN.click()
    }
    async successMsg(){
        await expect(this.successMSG).toBeVisible()
        return this.successMSG.innerText()
    }

}
export default RegisterUserPage