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
            prodArr.push(res[i].id + ' | ' + res[i].product_name + ' | ' + res[i].price);
        }
        promptToBuy();
    });
}


function promptToBuy(){
    inquirer.prompt([
        {
        message: "Select the product you'd like to order",
        name: "product",
        type: "list",
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
    ]).then(function(res){
        var productChosen = parseInt(res.product.split('|')[0].trim());
        connection.query("SELECT * FROM products WHERE ID=?", [productChosen], function(err, results){
            if(err) throw err;
            var availableQuantity = results[0].stock_quantity;
            if(availableQuantity >= res.quantity){
                let newQuantity = availableQuantity - res.quantity;
                let total = res.quantity * results[0].price;
                orderSuccess(productChosen, newQuantity, total);
            }
            else{
                console.log("INSUFFICIENT QUANTITY");
                orderAgain();
            }
        });
    });
}

function orderSuccess(id, qty, total){
    connection.query("UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: qty
      },
      {
        id: id
      }
    ], function(err, res){
        console.log("Your order is complete!");
        console.log("Your total is " + total);
        orderAgain();
    });
}

function orderAgain(){
    inquirer.prompt([
        {
            message: "Place another order?",
            name: "orderAgain",
            type: "list",
            choices: ["Yes", "No"]
        }
    ]).then(function(res){
        if(res.orderAgain == "Yes") order();
        else {connection.end()};
    })
}