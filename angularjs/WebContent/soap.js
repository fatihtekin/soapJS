var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


function readTextFile(file)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status == 200 || rawFile.status == 0)
            {
            	var allText = rawFile.responseText.split('\n');
            	for(var lineCount = 0; lineCount < allText.length; lineCount++){

            		try {						
            			var line = String(allText[lineCount]);
            			line = line.replace('\r','').split(/,/);
            			var accountId = line[0];
            			var amendedDate = getAmendedDate(accountId);            	    
            			console.info('AmendedDate for account '+accountId+' is '+amendedDate);
            			if(amendedDate === ''){
            				console.error('No amended date is retrieved for accountId: '+accountId);
            				continue;
            			}else{
            				changePaymentMethodToCC(accountId, amendedDate, line)
            			}
            			console.info('\n');
					} catch (e) {
						console.error('Error occured: '+e);
					}
            	}
            }else {
            	console.info(rawFile.status);						
			}
        }
    }
    rawFile.send(null);
    
}        


function changePaymentMethodToCC(accountNumber,amendedDate,line) {
	var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', 
    		'http://mvnodisempwas.eu.acncorp.com:1009/ws/dise3g/services/AccountPort', 
    		false);

    var expiryMonth = line[4];
	var expiryYear = line[3];
	var cardNumber = line[2];
	var paymentType = line[1];
	var cardReference = line[5];
	var sr =
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:def="http://mdsuk.com/ws/dise3g/account/definition">' +
        '<soapenv:Header/>'+
        '<soapenv:Body>' +
        '<def:UpdateRecurringPaymentDetails><def:Request><ExternalReference>PymntFromDDtoCC</ExternalReference>'+
        '<AccountNumber>'+accountNumber+'</AccountNumber>'+
        '<PaymentType>'+paymentType+'</PaymentType><PaymentTerm>S</PaymentTerm><PaymentDetails>'+
        '<PaymentCardDetails><PaymentCard><CardNumber>'+cardNumber+'</CardNumber>'+
        '<ExpiryYear>'+expiryYear+'</ExpiryYear>'+
        '<ExpiryMonth>'+expiryMonth+'</ExpiryMonth>'+
        '</PaymentCard><PaymentCardToken><CardReference>'+cardReference+'</CardReference>'+
        '<CardNumber>'+cardNumber+'</CardNumber>'+
        '<ExpiryYear>'+expiryYear+'</ExpiryYear>'+
        '<ExpiryMonth>'+expiryMonth+'</ExpiryMonth></PaymentCardToken></PaymentCardDetails></PaymentDetails>'+
        '<LastAmendedDate>'+amendedDate+'</LastAmendedDate>'+
        '</def:Request></def:UpdateRecurringPaymentDetails>' +
            '</soapenv:Body>' +
        '</soapenv:Envelope>';
    console.info('UpdateRecurringPaymentDetails Request for accountId:'+accountNumber+'\n'+sr);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
    	      console.info('UpdateRecurringPaymentDetails Response for accountId:'+accountNumber+'\n'+xmlhttp.responseText);
            if (xmlhttp.status == 200) {
    			var externalReference = xmlhttp.responseText.match(/<ExternalReference>(.*?)<\/ExternalReference>/i)[0]; 
    			console.info('Success DD to CC change for account id '+accountNumber );
            }else {
    			console.error('Failure DD to CC change for account id '+accountNumber );
			}
        }
    }
    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
	xmlhttp.setRequestHeader('Authorization', 'Basic QUNOV1MwMTA6V0VCQ09OTg==');
	xmlhttp.setRequestHeader('SOAPAction', '');
	xmlhttp.send(sr);
	return;
}


	function getAmendedDate(accountNumber) {
        	var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('POST', 
            		'http://mvnodisempwas.eu.acncorp.com:1009/ws/dise3g/services/AccountPort', 
            		false);

            var sr =
                '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:def="http://mdsuk.com/ws/dise3g/account/definition">' +
                '<soapenv:Header/>'+
                '<soapenv:Body>' +
                        '<def:QueryAccount><def:Request><ExternalReference>29200161</ExternalReference>'+
            '<AccountNumber>'+accountNumber+'</AccountNumber><Datasets><Dataset>BASIC</Dataset><Dataset>PAYMENT_DETAILS</Dataset>'
            +'</Datasets></def:Request></def:QueryAccount>' +
                    '</soapenv:Body>' +
                '</soapenv:Envelope>';
            console.info('QueryAccount Request for accountId:'+accountNumber+'\n'+sr);
            var amendedDate = '';
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {
                    console.info('QueryAccount Response for accountId:'+accountNumber+'\n'+xmlhttp.responseText);
                    if (xmlhttp.status == 200) {
            			amendedDate = xmlhttp.responseText.match(/<LastAmendedDate>(.*?)<\/LastAmendedDate>/i)[1]; 
            			console.info('Success get amendedDate for account id '+accountNumber+' amendedDate is '+amendedDate);
                    }else {
            			console.error('Failure get amendedDate for account id '+accountNumber);
					}
                }
            }
            xmlhttp.setRequestHeader('Content-Type', 'text/xml');
			xmlhttp.setRequestHeader('Authorization', 'Basic QUNOV1MwMTA6V0VCQ09OTg==');
			xmlhttp.setRequestHeader('SOAPAction', '');
			xmlhttp.send(sr);
			return amendedDate;
        }
        
        readTextFile('file:///dev/SIMREP/angularjs/WebContent/Accounts.txt');
