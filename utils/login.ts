// @ts-ignore
import fs from "node:fs";
import {expect} from "@playwright/test";

export async function login(request, username:string, password:string){
    const response=await request.get(`https://parabank.parasoft.com/parabank/services/bank/login/${username}/${password}`, {
        headers: { Accept: 'application/json' }
    })
    expect(response.status()).toBe(200)
    return await response.json()
}