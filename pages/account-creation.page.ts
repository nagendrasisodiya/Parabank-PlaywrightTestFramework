import {expect, Locator, Page} from "@playwright/test";

class AccountCreation{
    page:Page
    // navigates to new account creation
    newAccount:Locator
    accountType:Locator
    // existingAccount:Locator
    openNewAccountBTN:Locator
    // conforming message
    conformationMsg01:Locator
    conformationMsg02:Locator
    // new account number
    newAccountNumber:Locator
    constructor(page:Page) {
        this.page=page
        this.newAccount=page.getByRole('link', {name:'Open New Account'})
        this.accountType=page.locator('#type')
        // this.existingAccount=page.locator('#fromAccountId')
        this.openNewAccountBTN=page.getByRole('button', {name:'Open New Account'})
        this.conformationMsg01=page.locator('//div[@id="openAccountResult"]/h1')
        this.conformationMsg02=page.locator('//div[@id="openAccountResult"]/p[.="Congratulations, your account is now open."]')
        this.newAccountNumber=page.locator('#newAccountId')
    }

    async openNewAccount(accountType:string){
        let type:string=accountType==="CHECKING"?'0':'1'
        // navigates to new account creation
        await this.newAccount.click()

        await this.page.waitForLoadState('networkidle')
        await this.accountType.waitFor({ state: 'visible', timeout: 5000 });
        await this.accountType.selectOption(type)
        await this.openNewAccountBTN.click()

        await expect(this.conformationMsg01).toBeVisible()
        await expect(this.conformationMsg01).toHaveText('Account Opened!');
        await expect(this.conformationMsg02).toContainText('Congratulations, your account is now open.');
        let accNo=await this.newAccountNumber.innerText()
        return Number(accNo)
    }
    async captureConformationMsg(){
        await expect(this.conformationMsg02).toBeVisible()
        return this.conformationMsg02.innerText()
    }
}export default AccountCreation