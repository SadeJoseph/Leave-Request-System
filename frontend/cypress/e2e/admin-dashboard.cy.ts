// cypress/e2e/admin-dashboard.cy.ts
describe("Admin Dashboard", () => {
  beforeEach(() => {
    // Mock login as admin
    cy.intercept("POST", "http://localhost:8900/api/login", {
      statusCode: 200,
      body: {
        token: "fake-jwt-token",
        user: {
          id: 1,
          firstname: "Admin",
          surname: "Example",
          email: "admin@example.com",
          role: { id: 1, name: "admin" },
        },
      },
    }).as("mockLogin");

    cy.visit("http://localhost:8000/login");

    cy.get('[data-testid="login-email"]').type("admin@example.com");
    cy.get('[data-testid="login-password"]').type("AdminPass123");
    cy.get('[data-testid="login-submit"]').click();

    cy.wait("@mockLogin");
    cy.url().should("include", "/admin/dashboard");
  });

  it("renders roles and departments tables", () => {
    // Mock GET for roles and departments
    cy.intercept("GET", "http://localhost:8900/api/roles", {
      statusCode: 200,
      body: [{ id: 1, name: "manager" }, { id: 2, name: "employee" }],
    }).as("getRoles");

    cy.intercept("GET", "http://localhost:8900/api/departments", {
      statusCode: 200,
      body: [{ id: 1, name: "Engineering" }, { id: 2, name: "HR" }],
    }).as("getDepartments");

    cy.reload();
    cy.wait("@getRoles");
    cy.wait("@getDepartments");

    cy.contains("Roles");
    cy.contains("Departments");
  });

  it("can add a new department", () => {
    cy.intercept("POST", "http://localhost:8900/api/departments", {
      statusCode: 201,
      body: { id: 3, name: "Finance" },
    }).as("createDept");

    cy.get('[data-testid="new-department-input"]').type("Finance");
    cy.get('[data-testid="add-department"]').click();

    cy.wait("@createDept").its("response.statusCode").should("eq", 201);
  });

  it("can reset all leave balances", () => {
    cy.intercept("PATCH", "http://localhost:8900/api/users/reset-all-balances", {
      statusCode: 200,
      body: { message: "All balances reset to 25" },
    }).as("resetBalances");

    cy.get('[data-testid="reset-balances"]').click();

    cy.wait("@resetBalances").its("response.statusCode").should("eq", 200);
  });
});
