describe("Admin Dashboard & Management Pages", () => {
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

  it("navigates to Management page and shows roles & departments", () => {
    // Mock API calls
    cy.intercept("GET", "http://localhost:8900/api/roles", {
      statusCode: 200,
      body: [{ id: 1, name: "manager" }, { id: 2, name: "employee" }],
    }).as("getRoles");

    cy.intercept("GET", "http://localhost:8900/api/departments", {
      statusCode: 200,
      body: [{ id: 1, name: "Engineering" }, { id: 2, name: "HR" }],
    }).as("getDepartments");

    cy.intercept("GET", "http://localhost:8900/api/users", {
      statusCode: 200,
      body: [{ id: 21, firstname: "Staff", surname: "Example", email: "staff1@example.com" }],
    }).as("getUsers");

    cy.intercept("GET", "http://localhost:8900/api/user-management", {
      statusCode: 200,
      body: [],
    }).as("getUserManagement");

    // Open side nav and click management
    cy.get('[data-testid="menu-button"]').click();
    cy.get('[data-testid="nav-management"]').click();

    // Correct navigation path
    cy.url().should("include", "/admin/management");

    // Wait for mocks
    cy.wait("@getRoles");
    cy.wait("@getDepartments");
    cy.wait("@getUsers");
    cy.wait("@getUserManagement");

    // Verify tables
    cy.get('[data-testid="roles-table"]').should("exist");
    cy.get('[data-testid="departments-table"]').should("exist");
  });
});
