import type { TaskDefinition } from "./library";

const RULES = `How your answer is judged
- Write standard SQL for SQLite, and exactly one SELECT statement.
- The rows must match exactly, in the right order. Column names don't matter, but column order does.
- Numbers are printed without trailing zeros.
- Statements that change data or settings (DELETE, UPDATE, PRAGMA and so on) are refused.`;

export const SQL_TASKS: TaskDefinition[] = [
  {
    slug: "sql-department-totals",
    kind: "SQL",
    title: "Department headcount and payroll",
    skills: ["SQL"],
    timeLimitMs: 3000,
    instructions: `The table employees has the columns id, name, dept and salary. The salary can be NULL.

Write one SELECT statement that returns, for every department with at least 2 employees: the department, the number of employees, and the total salary.

Output columns, in this order: dept, headcount, total
- Every employee counts toward the headcount, even one whose salary is NULL. A NULL salary adds nothing to the total.
- Order the rows by total, highest first. When totals are equal, order by dept, A to Z.

${RULES}`,
    starterCode: `-- Write one SELECT statement. Output columns, in order: dept, headcount, total
SELECT dept, COUNT(*), SUM(salary)
FROM employees
GROUP BY dept;
`,
    testCases: [
      {
        label: "Sample 1",
        input: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Asha', 'Eng', 100), (2, 'Ben', 'Eng', 80), (3, 'Chitra', 'Ops', 60), (4, 'Dev', 'Ops', 50), (5, 'Esha', 'HR', 70);
`,
        expectedOutput: "Eng|2|180\nOps|2|110",
        hidden: false,
      },
      {
        label: "Sample 2",
        input: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'Mia', 'Sales', 50), (2, 'Noah', 'Sales', 70), (3, 'Omar', 'Dev', 90), (4, 'Pia', 'Dev', 20), (5, 'Quinn', 'Dev', 40);
`,
        expectedOutput: "Dev|3|150\nSales|2|120",
        hidden: false,
      },
      {
        label: "Tie on total",
        input: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'A', 'X', 10), (2, 'B', 'X', 20), (3, 'C', 'Y', 15), (4, 'D', 'Y', 15), (5, 'E', 'Z', 30);
`,
        expectedOutput: "X|2|30\nY|2|30",
        hidden: true,
      },
      {
        label: "Missing salaries",
        input: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'A', 'X', 10), (2, 'B', 'X', NULL), (3, 'C', 'Y', 5), (4, 'D', 'Y', 8);
`,
        expectedOutput: "Y|2|13\nX|2|10",
        hidden: true,
      },
      {
        label: "Many departments",
        input: `CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept TEXT, salary INTEGER);
INSERT INTO employees VALUES (1, 'a', 'D1', 5), (2, 'b', 'D1', 5), (3, 'c', 'D2', 9), (4, 'd', 'D2', 1), (5, 'e', 'D3', 100), (6, 'f', 'D4', 1), (7, 'g', 'D4', 1), (8, 'h', 'D4', 1);
`,
        expectedOutput: "D1|2|10\nD2|2|10\nD4|3|3",
        hidden: true,
      },
    ],
  },
  {
    slug: "sql-customers-without-orders",
    kind: "SQL",
    title: "Find customers with no orders",
    skills: ["SQL"],
    timeLimitMs: 3000,
    instructions: `The table customers has the columns id and name. The table orders has the columns id, customer_id and amount. An order's customer_id points to a customer's id, but it can be NULL, or point to a customer that doesn't exist.

Write one SELECT statement that returns the name of every customer who has placed no orders, in alphabetical order.

Output column: name

${RULES}`,
    starterCode: `-- Write one SELECT statement. Output column: name
SELECT name
FROM customers;
`,
    testCases: [
      {
        label: "Sample 1",
        input: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers VALUES (1, 'Asha'), (2, 'Ben'), (3, 'Chitra');
INSERT INTO orders VALUES (1, 1, 500), (2, 1, 200), (3, 3, 150);
`,
        expectedOutput: "Ben",
        hidden: false,
      },
      {
        label: "Sample 2",
        input: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers VALUES (1, 'Dev'), (2, 'Esha'), (3, 'Farah'), (4, 'Gita');
INSERT INTO orders VALUES (1, 2, 50);
`,
        expectedOutput: "Dev\nFarah\nGita",
        hidden: false,
      },
      {
        label: "Customer with many orders",
        input: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers VALUES (1, 'Zoe'), (2, 'Yan');
INSERT INTO orders VALUES (1, 1, 10), (2, 1, 20), (3, 1, 30);
`,
        expectedOutput: "Yan",
        hidden: true,
      },
      {
        label: "Order from an unknown customer",
        input: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers VALUES (1, 'Kai'), (2, 'Lea');
INSERT INTO orders VALUES (1, 2, 10), (2, 99, 5);
`,
        expectedOutput: "Kai",
        hidden: true,
      },
      {
        label: "Order with no customer",
        input: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers VALUES (1, 'Ann'), (2, 'Bob');
INSERT INTO orders VALUES (1, 1, 10), (2, NULL, 5);
`,
        expectedOutput: "Bob",
        hidden: true,
      },
      {
        label: "Alphabetical order",
        input: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers VALUES (1, 'Mia'), (2, 'Cara'), (3, 'Liam'), (4, 'Abe');
INSERT INTO orders VALUES (1, 2, 10);
`,
        expectedOutput: "Abe\nLiam\nMia",
        hidden: true,
      },
    ],
  },
  {
    slug: "sql-top-customers",
    kind: "SQL",
    title: "Find the big spenders",
    skills: ["SQL"],
    timeLimitMs: 3000,
    instructions: `The table customers has the columns id and name. The table orders has the columns id, customer_id and amount. Every amount is a whole number.

Write one SELECT statement that returns each customer whose orders add up to 100 or more: the customer's name, the total amount they spent, and how many orders they placed. Ignore orders whose customer_id doesn't match any customer.

Output columns, in this order: name, total, order_count
- Order the rows by total, highest first. When totals are equal, order by name, A to Z.

${RULES}`,
    starterCode: `-- Write one SELECT statement. Output columns, in order: name, total, order_count
SELECT c.name, SUM(o.amount), COUNT(*)
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.name;
`,
    testCases: [
      {
        label: "Sample 1",
        input: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers VALUES (1, 'Asha'), (2, 'Ben'), (3, 'Chitra');
INSERT INTO orders VALUES (1, 1, 60), (2, 1, 70), (3, 2, 40), (4, 3, 200);
`,
        expectedOutput: "Chitra|200|1\nAsha|130|2",
        hidden: false,
      },
      {
        label: "Sample 2",
        input: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers VALUES (1, 'Dev'), (2, 'Esha');
INSERT INTO orders VALUES (1, 1, 100), (2, 2, 99), (3, 2, 1);
`,
        expectedOutput: "Dev|100|1\nEsha|100|2",
        hidden: false,
      },
      {
        label: "Customer with no orders",
        input: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers VALUES (1, 'Ann'), (2, 'Bob');
INSERT INTO orders VALUES (1, 1, 150);
`,
        expectedOutput: "Ann|150|1",
        hidden: true,
      },
      {
        label: "Just below the threshold",
        input: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers VALUES (1, 'Cy'), (2, 'Di');
INSERT INTO orders VALUES (1, 1, 99), (2, 2, 120);
`,
        expectedOutput: "Di|120|1",
        hidden: true,
      },
      {
        label: "Many small orders",
        input: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers VALUES (1, 'Eli'), (2, 'Fay'), (3, 'Gus');
INSERT INTO orders VALUES (1, 1, 30), (2, 1, 30), (3, 1, 30), (4, 1, 30), (5, 2, 120), (6, 3, 99);
`,
        expectedOutput: "Eli|120|4\nFay|120|1",
        hidden: true,
      },
      {
        label: "Order from an unknown customer",
        input: `CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER);
INSERT INTO customers VALUES (1, 'Hal');
INSERT INTO orders VALUES (1, 1, 100), (2, 42, 500);
`,
        expectedOutput: "Hal|100|1",
        hidden: true,
      },
    ],
  },
];