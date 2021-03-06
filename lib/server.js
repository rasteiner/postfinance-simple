var sha1 = require('sha1');
var escape = require('escape-html');

var inputparams = require('./sign-in-params.json');
var outputparams = require('./sign-out-params.json');

var endpoints = {
  test: "https://e-payment.postfinance.ch/ncol/test/orderstandard.asp",
  production: "https://e-payment.postfinance.ch/ncol/prod/orderstandard.asp"
}

function Server(opts) {
  this.pspid = opts.pspid;
  this.sha_in = opts.sha_in;
  this.sha_out = opts.sha_out;
  this.isTest = (opts.isTest === undefined)? true : !!opts.isTest;
}

Server.prototype.getFormFields = function(transaction) {
  var signstring = "";
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
      signstring += inputparams[i] + "=" + param + this.sha_in;
      fields.push({name: inputparams[i], value: param}); 
    }
  }
  fields.push({
    name: 'SHASIGN',
    value: sha1(signstring)
  });
  return fields;
};

Server.prototype.getFormFieldsHTML = function(transaction) {
  var str = "";
  var fields = this.getFormFields(transaction);

  for(var i = 0; i < fields.length; i++) {
    str += '<input type="hidden" name="' + fields[i].name + '" value="' + escape(fields[i].value) + '">';
  }

  return str;
}

Server.prototype.getFormHTML = function(transaction, opts) {
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

  str += this.getFormFieldsHTML(transaction);

  str += '</form>';

  return str;
};

Server.prototype.getSelfSubmittingPage = function(transaction) {
  var str = "<!doctype html>\n<html><head><title>redirecting...</title></head><body>";

  str += this.getFormHTML(transaction, {id: 'checkout'});

  str += "<script>document.getElementById('checkout').submit();</script>";

  str += "</body></html>";

  return str;
};


function normalize(object) {
  for(var k in object) {
    if(object.hasOwnProperty(k)) {
      if(k !== k.toUpperCase()) {
        object[k.toUpperCase()] = object[k];
        delete object[k];
      }
    } 
  }
}


Server.prototype.isValid = function(queryparams) {
  var param;
  var signstring = "";

  if(this.sha_out === undefined) {
    throw new Exception('sha_out was not set!');
  }

  normalize(queryparams);

  if(queryparams.SHASIGN === undefined) {
    return false;
  }

  for(var i = 0; i < outputparams.length; i++) {
    param = queryparams[outputparams[i]];
    if(param) {
      signstring += outputparams[i] + '=' + param + this.sha_out;
    }
  }

  return queryparams.SHASIGN.toLowerCase() == sha1(signstring).toLowerCase();
};

module.exports = Server;