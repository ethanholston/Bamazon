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
  function Dept(id, name, overhead, sales, profit){
    this.department_id = id,
    this.department_name = name,
    this.overhead = overhead,
    this.dept_sales = sales,
    this.total_profit = profit
  };
  connection.query("SELECT * FROM departments", function(err, query){
    var deptArr = []
    for(let i=0; i<query.length; i++){
      var curDept = query[i].department_name;
      connection.query("SELECT SUM(product_sales) as 'total_sales' FROM products WHERE department_name=?", [curDept], function(err, query2){
      let totalSales;
      if(query2[0].total_sales == null) totalSales = 0;
      else{totalSales = parseFloat(query2[0].total_sales.toFixed(2))}
      let totalProfit = totalSales - parseFloat(query[i].over_head_costs.toFixed(2));
      totalProfit = totalProfit.toFixed(2);
      let newDept = new Dept(query[i].department_id, query[i].department_name, query[i].over_head_costs, totalSales.toFixed(2), totalProfit);
      deptArr.push(newDept);
      if(i==query.length-1){
        console.table(deptArr);
        again();
      }
      });
      
    }
    // console.table(deptArr);
    // again();
  });
}

function makeDept(){
  inquirer.prompt([
    {
      message: "What is the name of the department?",
      name: "deptName"
    },
    {
      message: "What are the overhead costs for this department?",
      name: "overhead"
    }
  ]).then(function(res){
    connection.query("SELECT * FROM departments WHERE department_name=?", [res.deptName], function(err, result){
      if(err) throw err;
      if(result.length > 0){
        console.log("Department already exists"); 
        again();
      }
      else {
        connection.query("INSERT INTO departments SET ?", 
          [
            {
              department_name: res.deptName,
              over_head_costs: res.overhead
            }
          ], function(err){
          if(err) throw err;
          console.log(res.deptName + " has been added");
          again();
        });
      }
    });
  });
}

function again(){
  inquirer.prompt([
    {
      message: "Do you want to do anything else?",
      name: "again",
      type: "list",
      choices: ["Yes", "No"]
    }
  ]).then(function(res){
    if(res.again == "Yes"){
      listCommands();
    }
    else{
      connection.end();
    }
  });
}

