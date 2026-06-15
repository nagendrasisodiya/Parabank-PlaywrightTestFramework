import {APIRequest, expect} from "@playwright/test";
import path = require("node:path");
// @ts-ignore
import fs from "node:fs";

export async function getAccounts(request, customerId:number){
    const customerAccountResponse=await request.get(`https://parabank.parasoft.com/parabank/services/bank/customers/${customerId}/accounts`, {
        headers: {Accept:'application/json'}
    })
    expect(customerAccountResponse.status()).toBe(200)
    let accounts=await customerAccountResponse.json()
    console.log(accounts)
    return accounts
}