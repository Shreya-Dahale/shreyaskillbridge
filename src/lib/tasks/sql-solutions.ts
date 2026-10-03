// Reference solutions for SQL tasks. Never import this file from app pages or actions.
export const SQL_SOLUTIONS: Record<string, string> = {
  "sql-department-totals": `SELECT dept, COUNT(*) AS headcount, SUM(salary) AS total
FROM employees
GROUP BY dept
HAVING COUNT(*) >= 2
ORDER BY total DESC, dept ASC;
`,
  "sql-customers-without-orders": `SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL
ORDER BY c.name;
`,
  "sql-top-customers": `SELECT c.name AS name, SUM(o.amount) AS total, COUNT(*) AS order_count
FROM customers c
JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name
HAVING SUM(o.amount) >= 100
ORDER BY total DESC, c.name ASC;
`,
};