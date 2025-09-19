import React, { useState } from "react";
import { Container, Box, TextField, Button, Typography, Paper } from "@mui/material";
import { navigate } from "gatsby"; 

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const response = await fetch("http://localhost:8900/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Login failed");
    }

    const data = await response.json();

    // Store token + user
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    let roleName = data.user.role.name.toLowerCase();
    if (roleName === "staff") {
  roleName = "employee";
}
    
localStorage.setItem("role", roleName);


    // Redirect by role
    if (roleName === "admin") {
      navigate("/admin/dashboard");
    } else if (roleName === "manager") {
      navigate("/manager/dashboard");
    } else {
      navigate("/employee/dashboard");
    }

  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ mt: 12, p: 4, borderRadius: 2, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="Password"
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
