var sha1 = require('sha1');
var escape = require('escape-html');

var inputparams = require('./sign-in-params.json');

var endpoints = {
  test: "https://e-payment.postfinance.ch/ncol/test/orderstandard.asp",
  production: "https://e-payment.postfinance.ch/ncol/prod/orderstandard.asp"
}

function Server(opts) {
  this.pspid = opts.pspid;
  this.sha_in = opts.sha_in;
  this.isTest = (opts.isTest === undefined)? true : !!opts.isTest;
}

Server.prototype.getFormFields = function(transaction) {
  var signarray = [];
  var fields = [];
  var param;

  if(transaction.PSPID === undefined) {
    if(this.pspid === undefined) {
      throw new Exception('PSPID was not set!');
    }
    transaction.PSPID = this.pspid;
  }

  for(var i = 0; i < inputparams.length; i++) {
    param = transaction[inputparams[i]];
    if(param) {
      signarray.push(inputparams[i] + "=" + param);
      fields.push({name: inputparams[i], value: param}); 
    }
  }
  fields.push({
    name: 'SHASIGN', 
    value: sha1(signarray.join(this.sha_in))
  });
  return fields;
};

Server.prototype.getFormHTML = function(transaction, opts) {
  var fields = this.getFormFields(transaction);
  var str = '<form method="post" action="';

  if(this.isTest) {
    str += endpoints.test;
  } else {
    str += endpoints.production;
  }
  str += '"';

  if(typeof opts !== 'undefined') {
    if(opts.id) {
      str += ' id="' + opts.id + '"';
    }
  
    if(opts.name) {
      str += ' name="' + opts.name + '"';
    }
  }

  str += '>';

  for(var i = 0; i < fields.length; i++) {
    str += '<input type="hidden" name="' + fields[i].name + '" value="' + escape(fields[i].value) + '">';
  }

  str += '</form>';

  return str;
};

module.exports = Server;