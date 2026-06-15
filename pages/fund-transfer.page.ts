import {expect, Locator, Page} from "@playwright/test";

class FundTransfer{
    page:Page

    navigateToFundTransfer:Locator
    // transfer details
    amountInput:Locator
    fromAccountNumberDRP:Locator
    toAccountNumberDRP:Locator
    transferBTN:Locator
    // transfer success message
    transferStatus:Locator
    //locator to verify fund transfer
    amountTransferred:Locator
    sourceAccount:Locator
    destinationAccount:Locator
    // failure msg
    failureMessage:Locator
    constructor(page:Page) {
        this.page=page
        //navigate to fund transfer
        this.navigateToFundTransfer=page.getByRole('link', {name:"Transfer Funds"})
        // transfer details
        this.amountInput=page.locator('//input[@id="amount"]')
        this.fromAccountNumberDRP=page.locator('//select[@id="fromAccountId"]')
        this.toAccountNumberDRP=page.locator('//select[@id="toAccountId"]')
        this.transferBTN=page.getByRole('button', {name:'Transfer'})
        // success message
        this.transferStatus=page.locator('//div[@id="showResult"]/h1')
        //locator to verify fund transfer
        this.amountTransferred=page.locator('span#amountResult')
        this.sourceAccount=page.locator('span#fromAccountIdResult')
        this.destinationAccount=page.locator('span#toAccountIdResult')
        // failure msg
        this.failureMessage=page.locator('//div[@id="showError"]/p')
    }
    async transferFund(amount:string, senderAccNo:string, receiverAccNo:string){
        await this.navigateToFundTransfer.click()
        await this.page.waitForLoadState('networkidle')

        await this.amountInput.waitFor({ state: 'visible', timeout: 7000 });
        await this.amountInput.fill(amount)
        await this.fromAccountNumberDRP.selectOption(senderAccNo)
        await this.toAccountNumberDRP.selectOption(receiverAccNo)
        await this.transferBTN.click()

        await this.page.waitForLoadState('networkidle')
        await expect(this.transferStatus).toHaveText('Transfer Complete!')
    }
    async verifyFundTransfer(amountToVerify:string, senderAccNoToVerify:string, receiverAccNoToVerify:string){
        await this.amountTransferred.waitFor({ state: 'visible', timeout: 7000 });
        await expect(this.amountTransferred).toHaveText(amountToVerify)
        await expect(this.sourceAccount).toHaveText(senderAccNoToVerify)
        await expect(this.destinationAccount).toHaveText(receiverAccNoToVerify)
    }
}
export default FundTransfer