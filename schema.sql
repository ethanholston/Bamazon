DROP database IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
	id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50),
    department_name VARCHAR(50),
    stock_quantity INT,
    price DECIMAL(11,2),
    total_profit DECIMAL(11,2),
    PRIMARY KEY(id)
);

CREATE TABLE departments(
    department_id INT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(50),
    over_head_costs INT,
    PRIMARY KEY (department_id)
);

SELECT * from products;