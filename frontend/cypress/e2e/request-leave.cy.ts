// cypress/e2e/request-leave.cy.ts
describe("Request Leave Flow", () => {
  beforeEach(() => {
    // Intercept login request and mock success
    cy.intercept("POST", "http://localhost:8900/api/login", {
      statusCode: 200,
      body: {
        token: "fake-jwt-token",
        user: {
          id: 21,
          firstname: "Staff",
          surname: "Example",
          email: "employee@example.com",
          role: { id: 3, name: "employee" },
        },
      },
    }).as("mockLogin");

    cy.visit("http://localhost:8000/login");

    // Perform login (mocked once)
    cy.get('[data-testid="login-email"]').type("employee@example.com");
    cy.get('[data-testid="login-password"]').type("EmployeePass123");
    cy.get('[data-testid="login-submit"]').click();

    cy.wait("@mockLogin");
    cy.url().should("include", "/employee/dashboard");
  });

  it("navigates to request leave form and renders fields", () => {
    cy.get('[data-testid="menu-button"]').click();
    cy.get('[data-testid="nav-request-leave"]').click();

    cy.url().should("include", "/request-leave");

    cy.get('[data-testid="start-date-input"]').should("exist");
    cy.get('[data-testid="end-date-input"]').should("exist");
    cy.get('[data-testid="leave-type-select"]').should("exist");
    cy.get('[data-testid="reason-input"]').should("exist");
    cy.get('[data-testid="submit-request"]').should("exist");
  });

  it("submits a valid leave request", () => {
    cy.get('[data-testid="menu-button"]').click();
    cy.get('[data-testid="nav-request-leave"]').click();

    cy.intercept("POST", "http://localhost:8900/api/leave-requests", {
      statusCode: 201,
      body: { message: "Leave request created successfully" },
    }).as("createLeaveRequest");

    cy.get('[data-testid="start-date-input"]').type("2026-03-16");
    cy.get('[data-testid="end-date-input"]').type("2026-03-19");
    cy.get('[data-testid="reason-input"]').type("Family trip");
    cy.get('[data-testid="submit-request"]').click();

    cy.wait("@createLeaveRequest");
  });
});
