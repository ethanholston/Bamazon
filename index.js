var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon"
});

connection.connect(function(err){
    if(err) throw err;
    order();
});

var prodArr = [];

function order(){
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;
        for(let i=0; i<res.length; i++){
            prodArr.push(res[i].product_name);
        }
        promptToBuy();
    });
}


function promptToBuy(){
    inquirer.prompt([
        {
        message: "Select the product you'd like to order",
        name: "product",
        type: "rawlist",
        choices: prodArr
        },
        {
        message: "How many would you like to order?",
        name: "quantity",
        validate: function(value) {
            if (isNaN(value) === false) {
            return true;
            }
            return false;
        }
        }
    ]).then(function(res){ //NEEDS TO BE FIXED
        var availableQty = connection.query("SELECT FROM products WHERE ID ?", [res.product]);
        console.log(availableQty);
    });
}