var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require('console.table');

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
            choices: ["1 | View Product Sales by Department", "2 | Create a New Department"],
            type: "list",
            name: "command"
        }
    ]).then(function(res){
        var command = res.command.split("|")[0].trim();
        if (command == 1) viewSales();
        else{makeDept()};
    });
}

function viewSales(){
  var deptArr = [];
  connection.query("SELECT * FROM departments", function(err, res){
    if(err) throw err;
    for(let i=0; i<res.length; i++){
      deptArr.push(res[i].department_name);
    }
    inquirer.prompt([
      {
        message: "What department would you like to view sales for?",
        choices: deptArr,
        type: "list",
        name: "chosenDept"
      }
    ]).then(function(res){
      connection.query("SELECT * FROM departments WHERE department_name=?", [res.chosenDept], function(err, query){
        var productSales=0;
        connection.query("SELECT * FROM products WHERE department_name=?", [res.chosenDept], function(err, query2){
          if(err) throw err;          
          for(let i=0; i<query2.length; i++){
            if(query2[i].product_sales){
              productSales += parseFloat(query2[i].product_sales.toFixed(2));
            }
          }
          console.log("Product sales " + productSales);
          var totalProfit = productSales - parseFloat(query[0].over_head_costs.toFixed(2));
          var data = [
            {
              id: query[0].department_id,
              name: query[0].department_name,
              overhead_costs: query[0].over_head_costs,
              product_sales: productSales,
              total_profit: totalProfit
            }
          ]
          console.table(data);
        })
      });
    });
  });
}
