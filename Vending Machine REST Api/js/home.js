$(document).ready(function () {
	//loads vending machine
	clearAll();
	loadVendingMachine();
	
	//various insert money functions
	insertDollar();
	insertQuarter();
	insertDime();
	insertNickel();
	//gets user change
	getChange();
	//buys item for user
	purchaseItem();
	//global variable
	var balance;
});

//function to display vending machine contents to user
function loadVendingMachine(){
	//emptys potential api error already loaded
    $('#errorMessages').empty();
	//clears vending machine to prevent it from being duplicated on refresh
	clearVendingMachine();
	//grabs the corresponding table element for easier repeated use
	var contentRows = $('#contentRows');
	//ajax call to grab an array of items in the api
	$.ajax({
        type: 'GET',
        url: 'http://vending.us-east-1.elasticbeanstalk.com/items',
        success: function(snackArray) {
			var row = '<div class="row">';
			$.each(snackArray, function(index, snack){
				row += '<div class = "col-md-4" style = "border: 1px solid black;text-align:center; padding-top: 10px; padding-bottom:10px">';
				row += '<td><a onclick="selectItem('+ snack.id +')">ID: ' + snack.id + '<br>';
				row += snack.name + '<br>';
				row += '$' + snack.price.toFixed(2) + '<br>';
				row += 'Quantity Left: ' + snack.quantity + '<br></a></td>';
				row += '</div>';

			})
			row += '</div>';
			contentRows.append(row);
        },
        error: function() {
			//error message if api cannot be reached
			$('#errorMessages')
                .append($('<li>')
                .attr({class: 'list-group-item list-group-item-danger'})
                .text('Error calling web service.  Please try again later.'));
        }
    })
}

//adds a dollar to balance, rounds to overcome percision error
function insertDollar(){
	$('#addDollar').click(function(){
		balance = +$('#moneyDisplay').val();
		balance = balance + 1.00;
		$('#moneyDisplay').val(balance.toFixed(2));
	});
}

//adds a quarter to balance,rounds to overcome percision error
function insertQuarter(){
	$('#addQuarter').click(function(){
		balance = +$('#moneyDisplay').val();
		balance = balance + 0.25;
		$('#moneyDisplay').val(balance.toFixed(2));
	});
}

//adds a dime to balance, rounds to overcome percision error
function insertDime(){
	$('#addDime').click(function(){
		balance = +$('#moneyDisplay').val();
		balance = balance + 0.10;
		$('#moneyDisplay').val(balance.toFixed(2));
	});
}

//adds a nickel to balance, rounds to overcome percision error
function insertNickel(){
	$('#addNickel').click(function(){
		balance = +$('#moneyDisplay').val();
		balance = balance + 0.05;
		$('#moneyDisplay').val(balance.toFixed(2));
	});
}

//function to return change based on current balance
function getChange(){
	$('#getChangebtn').click(function(){
		//checks to see if balance is empty if it is print a message and end function
		if($('#moneyDisplay').val() == ''){
			$('#changeDisplay').val('No Change');
			$('#itemName').val('');
			$('#messageDisplay').val('');
			return false;
		}
		//variable set up
		balance = +$('#moneyDisplay').val();
		balance = balance * 100;
		//calculates number of each coin
		var numQuarters = Math.floor(balance/25);
		balance = balance - (numQuarters*25);
		var numDimes = Math.floor(balance/10);
		balance = balance - (numDimes*10);
		var numNickels = Math.floor(balance/5);
		var numPennies = balance - (numNickels*5);
		numPennies = Math.floor(numPennies);
		//displays change to user
		changeMessage(numQuarters, numDimes, numNickels, numPennies);
		$('#messageDisplay').val('');
	});
}

//emptys out the main table
function clearVendingMachine() {
    $('#contentRows').empty();
}

// selects item and makes id visible to user
function selectItem(id){
	$('#itemName').val(id);
}

//purchases item from vending machine api
function purchaseItem(){
	$('#confirmPurchase').click(function(){
		//clears any displayed messages
		$('#messageDisplay').val('');
		//if no item selected display an error and ends program
		if($('#itemName').val() == ''){
			$('#messageDisplay').val('Please make a selection');
			$('#changeDisplay').val('');
			return false;
		}
		//gets the current balance 
		var id = $('#itemName').val();
		balance = +$('#moneyDisplay').val();
		//calls api with the item id and money inserted
		$.ajax({
			type: 'POST',
			url: 'http://vending.us-east-1.elasticbeanstalk.com/money/'+ balance + '/item/' + id,
			headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            'dataType': 'json',
			success: function(change){
				//takes the change returned and converts it into a string to be displayed to user
				changeMessage(change.quarters, change.dimes, change.nickels, change.pennies)
				//prints thank you message confirming success
				$('#messageDisplay').val('Thank You!!');
				loadVendingMachine();
			},
			error: function(message) {
				//parses the message returned from json object in the event of purchase failure and displays to user
				var error = JSON.parse(message.responseText);
				$('#messageDisplay').val(error.message);
            }
		});
	});
}
//ensure all readonly inputs are clear on load
function clearAll(){
	$('#messageDisplay').val('');
	$('#changeDisplay').val('');
	$('#moneyDisplay').val('');
	$('#itemName').val('');
}
//creates a message depending on coins to display to user
function changeMessage(numQuarters, numDimes, numNickels, numPennies){
	var returnedBalance = '';
	if(numQuarters > 0){
		if(numQuarters ==1){
			returnedBalance += numQuarters + ' Quarter, ';
		}else{
			returnedBalance += numQuarters + ' Quarters, ';
		}
	}
	if(numDimes > 0){
		if(numDimes ==1){
			returnedBalance += numDimes + ' Dime, ';
		}else{
			returnedBalance += numDimes + ' Dimes, ';
		}
	}
	if(numNickels > 0){
		if(numNickels ==1){
			returnedBalance += numNickels + ' Nickel, ';
		}else{
			returnedBalance += numNickels + ' Nickels, ';
		}
	}
	if(numPennies > 0){
		if(numPennies ==1){
			returnedBalance += numPennies + ' Penny';
		}else{
			returnedBalance += numPennies + ' Pennies';
		}
	}
	$('#changeDisplay').val(returnedBalance);
	$('#moneyDisplay').val('');
	$('#itemName').val('');
}