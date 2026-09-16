import { describe, expect, it } from "vitest";
import { catalogInput, normalizeItem } from "../catalog";

describe("Reloadly public catalog", () => {
  it("does not present supplier USD amounts or commission as MXN credit", () => {
    const result = normalizeItem({ operatorId:626,name:"Amigo",country:{isoName:"MX"},senderCurrencyCode:"USD",destinationCurrencyCode:"MXN",fixedAmounts:[2,5,10],minAmount:2,maxAmount:50,commission:45,fees:{international:2},status:"ACTIVE" },"topups");
    expect(result).toMatchObject({currency:"MXN",denominations:[],minimum:null,maximum:null});
    expect(result).not.toHaveProperty("commission");
    expect(result).not.toHaveProperty("fees");
    expect(result).not.toHaveProperty("raw");
  });
  it("keeps actual recipient amounts and country restrictions", () => {
    expect(normalizeItem({productId:20,productName:"Tarjeta US",country:{isoName:"US"},global:true,recipientCurrencyCode:"USD",fixedRecipientDenominations:[25,50],senderCurrencyCode:"MXN",senderFee:5},"giftcards"))
      .toMatchObject({country:"US",global:true,currency:"USD",denominations:[25,50]});
  });
  it("rejects inactive products and unsafe provider logo URLs", () => {
    expect(normalizeItem({operatorId:1,name:"Unavailable",country:{isoName:"MX"},status:"INACTIVE"},"topups")).toBeNull();
    expect(normalizeItem({productId:2,productName:"Card",country:{isoName:"MX"},logoUrls:["javascript:alert(1)","https://untrusted.example/logo.png"]},"giftcards")?.logo).toBeNull();
  });
  it("rejects non-country paths and invalid pages before contacting Reloadly", () => {
    expect(catalogInput.safeParse({country:"../../accounts",page:0}).success).toBe(false);
    expect(catalogInput.safeParse({kind:"purchase",country:"MX"}).success).toBe(false);
  });
});
