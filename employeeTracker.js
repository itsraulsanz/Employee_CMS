const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

// Creating the connection 
const connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "manchester2021",
  database: "employeesDB",
});

connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}`);
  runPrompt();
});

const runPrompt = () => {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View All Employees",
        "View All Employees By Department",
        "View All Employees By Manager",
        "View All Departments",
        "View All Roles",
        "Add Employee",
        "Add Department",
        "Add Role",
        "Remove Employee",
        "Remove Department",
        "Remove Role",
        "Update Employee Role",
        "Update Employee Manager",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View All Employees":
          viewEmployees();
          break;

        case "View All Employees By Department":
          employeesByDepartmentSearch();
          break;

        case "View All Employees By Manager":
          employeesByManagerSearch();
          break;

        case "View All Departments":
          viewAllDepartments();
          break;

        case "View All Roles":
          viewAllRoles();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Add Role":
          addRole();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Remove Department":
          removeDepartment();
          break;

        case "Remove Role":
          removeRole();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "Update Employee Manager":
          updateEmployeeManager();
          break;

        default:
          console.log(`Invalid action: ${answer.action}`);
          break;
      }
    });
};

// View All Employees
function viewEmployees() {
  connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, employee.manager_id FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id;", function (err, res) {
    if (err) throw err;
    console.table(res);
    runPrompt();
  });
}
// View All Employees By Department
function employeesByDepartmentSearch() {
  connection.query(
    "SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      runPrompt();
    }
  );
}

// View All Employees By Manager
function employeesByManagerSearch() {
  connection.query(
    "SELECT employee.first_name, employee.last_name, employee.manager_id FROM employee ORDER BY employee.manager_id;",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      runPrompt();
    }
  );
}

// View All Departments
function viewAllDepartments() {
  connection.query("SELECT * FROM department;", function (err, res) {
    if (err) throw err;
    console.table(res);
    runPrompt();
  });
}

// View All Roles
function viewAllRoles() {
  connection.query("SELECT * FROM role;", function (err, res) {
    if (err) throw err;
    console.table(res);
    runPrompt();
  });
}

// Add Employee
function addEmployee() {
  return connection.query(
    "SELECT * FROM employee, role WHERE role.id = role_id ",
    (error, results) => {
      inquirer
        .prompt([
          {
            name: "first_name",
            type: "input",
            message: "What is the Employee's first name?",
          },
          {
            name: "last_name",
            type: "input",
            message: "What is your Employee's last name?",
          },
          {
            name: "manager_id",
            type: "list",
            choices() {
              return results.map(({ id, first_name, last_name }) => {
                return { name: first_name + " " + last_name, value: id };
              });
            },
            message: "Who is this employee's manager?",
          },
          {
            name: "role_id",
            type: "list",
            choices() {
              return results.map(({ id, title }) => {
                return { name: title, value: id };
              });
            },
            message: "What is this employee's role?",
          },
        ])
        .then((answers) => {
          connection.query(
            "INSERT INTO employee SET ?",
            answers,
            function (err, res) {
              if (err) throw err;
              console.log(`${answers.first_name} ${answers.last_name} has been inserted.`);
              runPrompt();
            }
          );
        });
    }
  );
}

// Add Department
function addDepartment() {
  inquirer
    .prompt([
      {
        name: "name",
        message: "What is the name of the department you want to add?",
      },
    ])
    .then((answers) => {
      connection.query(
        "INSERT INTO department SET ?",
        answers,
        function (err, res) {
          if (err) throw err;
          console.log(`The ${answers.name}'s Department has been inserted.`);
          runPrompt();
        }
      );
    });
}

// Add Role
function addRole() {
  connection.query("SELECT * FROM department", (error, results) => {
    if (error) throw error;
    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "What is the title for the role? ",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary for this position?",
        },
        {
          name: "department_id",
          type: "list",
          choices() {
            return results.map(({ id, name }) => {
              return { name: name, value: id };
            });
          },
          message: "What department will this role be within?",
        },
      ])
      .then((answers) => {
        connection.query(
          "INSERT INTO role SET ?",
          answers,
          function (err, res) {
            if (err) throw err;
            console.log(`The ${answers.title}'s Role has been inserted.`);
            runPrompt();
          }
        );
      });
  });
}

// Update Employee's Role
function updateEmployeeRole() {
  return connection.query("SELECT * FROM employee", (error, results) => {
    inquirer
      .prompt([
        {
          name: "employee_name",
          type: "list",
          choices() {
            return results.map(({ id, first_name, last_name }) => {
              return { name: first_name + " " + last_name, value: id };
            });
          },
          message: "Who is the employee you want to update?",
        },
        {
          name: "role",
          type: "list",
          choices() {
            return results.map(({ id, title }) => {
              return { name: title, value: id };
            });
          },
          message: "What is the new employee's role?",
        },
      ])
      .then((answers) => {
        connection.query(
          "UPDATE employee SET ? WHERE ?",
          [
            {
              role_id: answers.role,
            },
            {
              id: answers.employee_name,
            },
          ],
          function (err, res) {
            if (err) throw err;
            console.log(`The ${answers.employee_name}'s Role has been updated.`);
            runPrompt();
          }
        );
      });
  });
}

// Update Employee's Manager
function updateEmployeeManager() {
  return connection.query("SELECT * FROM employee", (error, results) => {
    inquirer
      .prompt([
        {
          name: "employee_name",
          type: "list",
          choices() {
            return results.map(({ id, first_name, last_name }) => {
              return { name: first_name + " " + last_name, value: id };
            });
          },
          message: "Who is the employee you want to update?",
        },
        {
          name: "manager",
          type: "list",
          choices() {
            return results.map(({ id, manager_id }) => {
              return { name: manager_id, value: id };
            });
          },
          message: "What is the new employee's manager?",
        },
      ])
      .then((answers) => {
        connection.query(
          "UPDATE employee SET ? WHERE ?",
          [
            {
              manager_id: answers.manager,
            },
            {
              id: answers.employee_name,
            },
          ],
          function (err, res) {
            if (err) throw err;
            console.log(`The ${answers.employee_name}'s Manager has been updated.`);
            runPrompt();
          }
        );
      });
  });
}

// Remove Employee
function removeEmployee() {
  return connection.query("SELECT * FROM employee", (error, results) => {
    inquirer
      .prompt([
        {
          name: "employee",
          type: "list",
          choices() {
            return results.map(({ id, first_name, last_name }) => {
              return { name: first_name + " " + last_name, value: id };
            });
          },
          message: "Who is the employee you want to remove?",
        },
      ])
      .then((answers) => {
        connection.query(
          "DELETE FROM employee WHERE ?",
          [{ id: answers.employee }],
          function (err, res) {
            if (err) throw err;
            console.log(`The employee with the ID ${answers.employee} has been removed.`);
            runPrompt();
          }
        );
      });
  });
}

// Remove Department
function removeDepartment() {
  return connection.query("SELECT * FROM department", (error, results) => {
    inquirer
      .prompt([
        {
          name: "department",
          type: "list",
          choices() {
            return results.map(({ id, name }) => {
              return { name: name, value: id };
            });
          },
          message: "What is the department you want to remove?",
        },
      ])
      .then((answers) => {
        connection.query(
          "DELETE FROM department WHERE ?",
          [{ id: answers.department }],
          function (err, res) {
            if (err) throw err;
            console.log(`The ${answers.department}'s Department has been removed.`);
            runPrompt();
          }
        );
      });
  });
}

// Remove Role
function removeRole() {
  return connection.query("SELECT * FROM role", (error, results) => {
    inquirer
      .prompt([
        {
          name: "role",
          type: "list",
          choices() {
            return results.map(({ id, title }) => {
              return { name: title, value: id };
            });
          },
          message: "What is the role you want to remove?",
        },
      ])
      .then((answers) => {
        connection.query(
          "DELETE FROM role WHERE ?",
          [{ id: answers.role }],
          function (err, res) {
            if (err) throw err;
            console.log(`The Role has been removed.`);
            runPrompt();
          }
        );
      });
  });
}