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
    prodArr = [];
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;
        for(let i=0; i<res.length; i++){
            prodArr.push(res[i].id + ' | Name: ' + res[i].product_name + ' | Price: ' + res[i].price + ' | Stock Qty: ' + res[i].stock_quantity);
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
            if(results[0].total_profit == null){
                 var totalProfit = 0;
            }
            else {
                var totalProfit = parseFloat(results[0].total_profit);
            };
            var availableQuantity = results[0].stock_quantity;
            if(availableQuantity >= res.quantity){
                let newQuantity = availableQuantity - res.quantity;
                let total = parseFloat((res.quantity * results[0].price).toFixed(2));
                let newProfit = (total + totalProfit).toFixed(2);
                orderSuccess(productChosen, newQuantity, total, newProfit);
            }
            else{
                console.log("INSUFFICIENT QUANTITY");
                orderAgain();
            }
        });
    });
}

function orderSuccess(id, qty, total, profit){
    connection.query("UPDATE products SET stock_quantity = ?, total_profit = ? WHERE id = ?",
    [qty, profit, id], function(err, res){
        if(err) throw err;
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