import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Layout from "../../components/Layout";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    firstname: "",
    surname: "",
    email: "",
    password: "",
    roleId: "",
    departmentId: "",
    annualLeaveBalance: 25,
  });

  const token = localStorage.getItem("token");

  // Fetch employees, roles, and departments
  const fetchData = async () => {
    try {
      const [empRes, depRes, roleRes] = await Promise.all([
        fetch("http://localhost:8900/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8900/api/departments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8900/api/roles", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const empJson = await empRes.json();
const depJson = await depRes.json();
const roleJson = await roleRes.json();

setEmployees(empJson.data || []);
setDepartments(depJson.data || []);
setRoles(Array.isArray(roleJson) ? roleJson : roleJson.data || []); 

    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle new user form input
  const handleInputChange = (field: string, value: any) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  // Save new user
  const handleSaveNewUser = async () => {
    try {
      const payload = {
        ...newUser,
        roleId: Number(newUser.roleId),
        departmentId: Number(newUser.departmentId),
        annualLeaveBalance: Number(newUser.annualLeaveBalance),
      };

      const res = await fetch("http://localhost:8900/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Failed to create user");
      }

      await fetchData(); // refresh table with latest

      setOpen(false);
      setNewUser({
        firstname: "",
        surname: "",
        email: "",
        password: "",
        roleId: "",
        departmentId: "",
        annualLeaveBalance: 25,
      });
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`http://localhost:8900/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(errorMsg || "Failed to delete user");
      }

      setEmployees((prev) => prev.filter((emp) => emp.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  return (
    <Layout role="admin">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Employee Management
        </Typography>

        {/* Add User Button */}
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          onClick={() => setOpen(true)}
          data-testid="add-employee-button"
        >
          + Add Employee
        </Button>

        {/* User Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="employees-table">
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.id}</TableCell>
                  <TableCell>
                    {emp.firstname} {emp.surname}
                  </TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.role?.name}</TableCell>
                  <TableCell>{emp.department?.name}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteUser(emp.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add User Modal */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="First Name"
              fullWidth
              value={newUser.firstname}
              onChange={(e) => handleInputChange("firstname", e.target.value)}
              data-testid="employee-firstname"
            />
            <TextField
              margin="dense"
              label="Surname"
              fullWidth
              value={newUser.surname}
              onChange={(e) => handleInputChange("surname", e.target.value)}
              data-testid="employee-surname"
            />
            <TextField
              margin="dense"
              label="Email"
              type="email"
              fullWidth
              value={newUser.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
                data-testid="employee-email"
            />
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={newUser.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
                data-testid="employee-password"
            />
            <Select
              fullWidth
              value={newUser.roleId}
              onChange={(e) => handleInputChange("roleId", e.target.value)}
              displayEmpty
              sx={{ mt: 2 }}
              data-testid="employee-role"
            >
              <MenuItem value="" >Select Role</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id} >
                  {role.name}
                </MenuItem>
              ))}
            </Select>
            <Select
              fullWidth
              value={newUser.departmentId}
              onChange={(e) => handleInputChange("departmentId", e.target.value)}
              displayEmpty
              sx={{ mt: 2 }}
              data-testid="employee-department"
            >
              <MenuItem value="" >Select Department</MenuItem>
              {departments.map((dep) => (
                <MenuItem key={dep.id} value={dep.id} >
                  {dep.name}
                </MenuItem>
              ))}
            </Select>
            <TextField
              margin="dense"
              label="Annual Leave Balance"
              type="number"
              fullWidth
              value={newUser.annualLeaveBalance}
              onChange={(e) =>
                handleInputChange("annualLeaveBalance", e.target.value)
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveNewUser}
              variant="contained"
              color="primary"
              data-testid="submit-employee"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default EmployeesPage;
