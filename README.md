


---------------------------------------
#Come back later, this is not ready yet
---------------------------------------


# postfinance-simple
Simple integration of Postfinance PSP into node and javascript

##Installation

```bash
npm i --save postfinance-simple
```

##Usage

```javascript
var Postfinance = require('postfinance-simple');
var server = new Postfinance({
    pspid: "myPSPID",
    sha_in: "myTerriblySecretSecret124!",
    isTest: true //set to false in production
});

var html = server.getFormHTML({
    PSPID: "myPSPID", //I can set the PSPID also here
    ORDERID: "123456789",
    AMOUNT: 1000,
    CURRENCY: "CHF",
    LANGUAGE: "en_US"
    //insert other non mandatory params here
}, 
//optionally I can specify id and name of the form 
{
    id: "checkoutForm",
    name: "checkout"
});
```
