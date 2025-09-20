// cypress/e2e/admin-employees.cy.ts
describe("Admin - Employees Page", () => {
  beforeEach(() => {
    // Mock login
    localStorage.setItem("token", "fake-jwt-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        firstname: "Admin",
        surname: "User",
        email: "admin@example.com",
        role: { id: 1, name: "admin" },
      })
    );

    // Mock API responses
    cy.intercept("GET", "http://localhost:8900/api/users", {
      statusCode: 200,
      body: [
        {
          id: 21,
          firstname: "Staff",
          surname: "Example",
          email: "staff1@example.com",
          role: { id: 3, name: "employee" },
          department: { id: 1, name: "Engineering" },
          annualLeaveBalance: 25,
        },
      ],
    }).as("getEmployees");

    cy.intercept("GET", "http://localhost:8900/api/roles", {
      statusCode: 200,
      body: [{ id: 3, name: "staff" }],
    }).as("getRoles");
    
cy.intercept("GET", "http://localhost:8900/api/departments", {
  statusCode: 200,
  body: {
    data: [
      { id: 1, name: "Engineering" },
      { id: 2, name: "HR" },
    ],
  },
}).as("getDepartments");

    // Visit page directly
    cy.visit("http://localhost:8000/admin/employees");
    cy.wait(["@getEmployees", "@getRoles", "@getDepartments"]);
  });

  it("renders the employees table", () => {
  // Mock employees list just for this test
  cy.intercept("GET", "http://localhost:8900/api/users", {
    statusCode: 200,
    body: {
      data: [
        {
          id: 21,
          firstname: "Staff",
          surname: "Example",
          email: "staff1@example.com",
          role: { id: 3, name: "staff" },
          department: { id: 1, name: "Engineering" },
          annualLeaveBalance: 25,
        },
      ],
    },
  }).as("getEmployees");

  cy.visit("http://localhost:8000/admin/employees");

  // Wait for the table to load data
  cy.wait("@getEmployees");

  // Assert the mocked employee shows up in the table
  cy.get('[data-testid="employees-table"]').should("exist");
  cy.contains("Staff Example").should("exist");
  cy.contains("staff").should("exist");
  cy.contains("Engineering").should("exist");
});

it("adds a new employee successfully", () => {
  // Intercept employee creation
  cy.intercept("POST", "http://localhost:8900/api/users", {
    statusCode: 201,
    body: { message: "Employee created successfully" },
  }).as("createEmployee");

  // Open add employee modal
  cy.get('[data-testid="add-employee-button"]').click();

  // Fill form
  cy.get('[data-testid="employee-firstname"]').type("New");
  cy.get('[data-testid="employee-surname"]').type("Employee");
  cy.get('[data-testid="employee-email"]').type("newemployee@example.com");
  cy.get('[data-testid="employee-password"]').type("EmployeePass123");

  // Select role by visible text
  cy.get('[data-testid="employee-role"]').click();
  cy.contains("li", "staff").click();

  // Select department by visible text
  cy.get('[data-testid="employee-department"]').click();
  cy.contains("li", "Engineering").click();

  // Submit
  cy.contains("Save").click();
  cy.wait("@createEmployee").its("response.statusCode").should("eq", 201);
});

});

