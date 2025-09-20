
describe("Manager Dashboard - Leave Actions", () => {
  beforeEach(() => {
    // Mock login
    cy.intercept("POST", "http://localhost:8900/api/login", {
      statusCode: 200,
      body: {
        token: "fake-jwt-token",
        user: {
          id: 2,
          firstname: "Manager",
          surname: "Example",
          email: "manager@example.com",
          role: { id: 2, name: "manager" },
        },
      },
    }).as("mockLogin");

    cy.visit("http://localhost:8000/login");

    // Perform login
    cy.get('[data-testid="login-email"]').type("manager@example.com");
    cy.get('[data-testid="login-password"]').type("ManagerPass123");
    cy.get('[data-testid="login-submit"]').click();

    cy.wait("@mockLogin");
    cy.url().should("include", "/manager/dashboard");

    // Mock GET requests for pending leave requests
    cy.intercept("GET", "http://localhost:8900/api/leave-requests", {
      statusCode: 200,
      body: {
        data: [
          {
            id: 101,
            leaveType: "Annual Leave",
            startDate: "2026-06-01",
            endDate: "2026-06-05",
            status: "Pending",
            user: { id: 21, firstname: "Staff", surname: "Example" },
          },
        ],
      },
    }).as("getLeaveRequests");

    cy.reload();
    cy.wait("@getLeaveRequests");
  });

  it("approves a leave request", () => {
    // Intercept PATCH 
    cy.intercept("PATCH", "http://localhost:8900/api/leave-requests/*/approve", {
      statusCode: 200,
      body: { message: "Leave approved" },
    }).as("approveLeave");

    cy.get('[data-testid="approve-button-101"]').click();
    cy.wait("@approveLeave").its("response.statusCode").should("eq", 200);
  });

  it("rejects a leave request", () => {
    // Intercept PATCH 
    cy.intercept("PATCH", "http://localhost:8900/api/leave-requests/*/reject", {
      statusCode: 200,
      body: { message: "Leave rejected" },
    }).as("rejectLeave");

    cy.get('[data-testid="reject-button-101"]').click();
    cy.wait("@rejectLeave").its("response.statusCode").should("eq", 200);
  });
});
