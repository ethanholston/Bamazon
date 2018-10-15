DROP database IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
	id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50),
    department_name VARCHAR(50),
    stock_quantity INT,
    price DECIMAL(11,2),
    PRIMARY KEY(id)
);

SELECT * from products;