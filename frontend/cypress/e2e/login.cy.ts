describe("Login Page", () => {
  beforeEach(() => {
    cy.visit("http://localhost:8000/login");;
  });

  it("logs in successfully as an employee", () => {
    cy.intercept("POST", "/api/login", {
      statusCode: 200,
      body: {
        token: "fake-jwt-token",
        user: {
          id: 1,
          firstname: "Test",
          surname: "User",
          email: "employee@example.com",
          role: { id: 3, name: "employee" },
        },
      },
    }).as("loginRequest");

    cy.get('[data-testid="login-email"]').type("employee@example.com");
    cy.get('[data-testid="login-password"]').type("Password123");
    cy.get('[data-testid="login-submit"]').click();

    cy.wait("@loginRequest");

    cy.window().then((win) => {
      const storedUser = JSON.parse(win.localStorage.getItem("user") || "{}");
      expect(storedUser.email).to.equal("employee@example.com");
    });

    //redirect
    cy.url().should("include", "/employee/dashboard");
  });

  it("shows error on invalid login", () => {
    cy.intercept("POST", "/api/login", {
      statusCode: 401,
      body: {
        error: { message: "Invalid credentials" },
      },
    }).as("loginRequest");

    cy.get('[data-testid="login-email"]').type("wrong@example.com");
    cy.get('[data-testid="login-password"]').type("badpassword");
    cy.get('[data-testid="login-submit"]').click();

    cy.wait("@loginRequest");

    cy.contains("Invalid credentials").should("be.visible");


    cy.url().should("include", "/login");
  });
});
