var inquirer = require("inquirer");
var mysql = require("mysql");
var Product = require("./Product.js");

commandArr = ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"];

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
  });
  
  connection.connect(function(err){
      if(err) throw err;
      listCommands();
  });

function listCommands(){
    inquirer.prompt([
        {
            message: "What would you like to do?",
            choices: commandArr,
            type: "list",
            name: "command"
        }
    ]).then(function(res){
        doStuff(commandArr.indexOf(res.command));
    });
}

function doStuff(x){
    switch(x){
        case 0: viewProducts();
            break;
        case 1: viewLowInv();
            break;
        case 2: addInv();
            break;
        case 3: addProduct();
            break;
    }
}

function viewProducts(){
    connection.query("SELECT * FROM products", function(err, res){
        if(err) throw err;
        for(let i=0; i<res.length; i++){
            console.log("ID: " + res[i].id + "\nName: " + res[i].product_name + " \nPrice: " + res[i].price + "\nStock Qty: " + res[i].stock_quantity);
            console.log("----------------");
        }
        goAgain();

    })
};

function viewLowInv(){
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res){
        if (err) throw err;
        if (res.length > 0){
            for(let i=0; i<res.length; i++){
                console.log("ID: " + res[i].id + "\nName: " + res[i].product_name + " \nPrice: " + res[i].price + "\nStock Qty: " + res[i].stock_quantity);
                console.log("----------------");
            }
            goAgain();

        }
        else{
            console.log("No items have a stock less than 5");
            goAgain();

        }
    })
};

function addInv(){
    var prodArr = [];
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;
        for(let i=0; i<res.length; i++){
            prodArr.push(res[i].id + ' | Name: ' + res[i].product_name + ' | Price: ' + res[i].price + ' | Stock Qty: ' + res[i].stock_quantity);
        }
        inquirer.prompt([
        {
        message: "Select the product you'd like to add inventory to",
        name: "product",
        type: "list",
        choices: prodArr
        },
        {
        message: "How many would you like to add?",
        name: "quantity",
        validate: function(value) {
            if (isNaN(value) === false) {
            return true;
            }
            return false;
        }
        }
        ]).then(function(res){
            var productChosen = res.product.split('|')[0].trim();
            connection.query("SELECT * FROM products WHERE ID=?", [productChosen], function(err, results){
                var newInv = results[0].stock_quantity + parseInt(res.quantity);
                connection.query("UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: newInv                
                    },
                    {
                        id: productChosen
                    }
                ], function(err, res){
                    if(err) throw err;
                    console.log("Inventory updated successfully!");
                    console.log(results[0].product_name + " stock_quantity is now " + newInv);
                    goAgain();

                });
            });
        });
    });
};

function addProduct(){
  var deptArr = [];
  connection.query("SELECT department_name FROM departments", function(err, res){
    for (let i=0; i<res.length; i++){
      deptArr.push(res[i].department_name);
    }
    inquirer.prompt([
        {
            message: "What is the name of the product you want to add?",
            name: "name",
            validate: function(input){
              if(input) return true;
              return false;
            }
        },
        {
            message: "What department is the product in?",
            name: "dept",
            type: "list",
            choices: deptArr
        },
        {
            message: "What is the price of the product?",
            name: "price",
            validate: function(value) {
                if (isNaN(value) === false) {
                return true;
                }
                return false;
            }
        },
        {
            message: "How much inventory of the product?",
            name: "inv",
            validate: function(value) {
                if (isNaN(value) === false) {
                return true;
                }
                return false;
            }
        }
    ]).then(function(res){
        var newProd = new Product(res.name, res.dept, res.price, res.inv);
        connection.query("INSERT INTO products SET ?", newProd, function(err, res){
            if(err) throw err;
            console.log(newProd.product_name + " was added successfully");
            goAgain();
        });
    });
  });
};

function goAgain(){
    inquirer.prompt([
        {
            message: "Do something else?",
            name: "goAgain",
            type: "list",
            choices: ["Yes", "No"]
        }
    ]).then(function(res){
        if(res.goAgain == "Yes") listCommands();
        else {connection.end()};
    })
}