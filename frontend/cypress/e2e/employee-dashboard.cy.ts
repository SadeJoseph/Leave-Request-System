
describe("Employee Dashboard", () => {
  beforeEach(() => {
    // Mock leave requests API
    cy.intercept("GET", "http://localhost:8900/api/leave-requests/mine", {
      statusCode: 200,
      body: {
        data: [
          {
            id: 1,
            leaveType: "Annual Leave",
            startDate: "2026-03-16",
            endDate: "2026-03-19",
            status: "Approved",
          },
        ],
      },
    }).as("getMyLeaveRequests");
  });

  it("shows employee's leave requests", () => {
    // set token + user
    localStorage.setItem("token", "fake-jwt-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 21,
        firstname: "Staff",
        surname: "Example",
        email: "staff1@example.com",
        role: { id: 3, name: "employee" },
      })
    );

    cy.visit("http://localhost:8000/employee/dashboard");

    cy.wait("@getMyLeaveRequests");

    cy.get('[data-testid="leave-requests-table"]').should("exist");
    cy.get('[data-testid="leave-requests-table"]').within(() => {
      cy.contains("Annual Leave");
      cy.contains("16/03/2026");
      cy.contains("19/03/2026");
      cy.contains("Approved");
    });
  });

  it("navigates to the request leave form from the side nav", () => {
    // set token + user
    localStorage.setItem("token", "fake-jwt-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 21,
        firstname: "Staff",
        surname: "Example",
        email: "staff1@example.com",
        role: { id: 3, name: "employee" },
      })
    );

    cy.visit("http://localhost:8000/employee/dashboard");

    // open the drawer via hamburger
    cy.get('[data-testid="menu-button"]').click();

    // then click the nav item
    cy.get('[data-testid="nav-request-leave"]').click();

    cy.url().should("include", "/request-leave");
  });

it("blocks access if no token is found", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  cy.visit("http://localhost:8000/employee/dashboard");

  // check that secure content isn't visible
  cy.get('[data-testid="leave-requests-table"]').should("not.exist");
});

});
