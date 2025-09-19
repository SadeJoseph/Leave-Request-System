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
  Button,
  TextField,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Layout from "../../components/Layout";

const ManagementPage = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [newRole, setNewRole] = useState("");
  const [newDept, setNewDept] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedManager, setSelectedManager] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all data
  const fetchData = async () => {
    try {
      const [roleRes, deptRes, userRes, assignRes] = await Promise.all([
        fetch("http://localhost:8900/api/roles", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8900/api/departments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8900/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:8900/api/user-management", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
const roleJson = await roleRes.json();
    const deptJson = await deptRes.json();
    const userJson = await userRes.json();
    const assignJson = await assignRes.json();
   
    setRoles(roleJson || []);
      setDepartments(deptJson.data || []);
    setUsers(userJson.data || []);
    setAssignments(
  Array.isArray(assignJson.data?.data) ? assignJson.data.data : []
);

    } catch (err) {
      console.error("Error fetching management data:", err);
    }

  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // ---- Role Management ----
  const addRole = async () => {
    try {
      await fetch("http://localhost:8900/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newRole }),
      });
      setNewRole("");
      fetchData();
    } catch (err) {
      console.error("Error adding role:", err);
    }
  };

  const deleteRole = async (id: number) => {
    try {
      await fetch(`http://localhost:8900/api/roles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error("Error deleting role:", err);
    }
  };

  // ---- Department Management ----
  const addDept = async () => {
    try {
      await fetch("http://localhost:8900/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newDept }),
      });
      setNewDept("");
      fetchData();
    } catch (err) {
      console.error("Error adding department:", err);
    }
  };

  const deleteDept = async (id: number) => {
    try {
      await fetch(`http://localhost:8900/api/departments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error("Error deleting department:", err);
    }
  };

  // ---- Manager Assignment ----
  const assignManager = async () => {
    try {
      await fetch("http://localhost:8900/api/user-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: selectedUser,
          managerId: selectedManager,
          startDate: new Date().toISOString().split("T")[0],
        }),
      });
      setSelectedUser("");
      setSelectedManager("");
      fetchData();
    } catch (err) {
      console.error("Error assigning manager:", err);
    }
  };

  const deleteAssignment = async (id: number) => {
    try {
      await fetch(`http://localhost:8900/api/user-management/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error("Error deleting assignment:", err);
    }
  };

  return (
    <Layout role="admin">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Admin Management
        </Typography>

        {/* ---- ROLES ---- */}
        <Typography variant="h6">Roles</Typography>
        <Box sx={{ display: "flex", mb: 2 }}>
          <TextField
            size="small"
            label="New Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          />
          <Button onClick={addRole} variant="contained" sx={{ ml: 2 }}>
            Add
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.id}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => deleteRole(role.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ---- DEPARTMENTS ---- */}
        <Typography variant="h6">Departments</Typography>
        <Box sx={{ display: "flex", mb: 2 }}>
          <TextField
            size="small"
            label="New Department"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
          />
          <Button onClick={addDept} variant="contained" sx={{ ml: 2 }}>
            Add
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dep) => (
                <TableRow key={dep.id}>
                  <TableCell>{dep.id}</TableCell>
                  <TableCell>{dep.name}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => deleteDept(dep.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

{/* ---- MANAGER ASSIGNMENTS ---- */}
<Typography variant="h6">Manager Assignments</Typography>
<Box sx={{ display: "flex", mb: 2 }}>
  <Select
    value={selectedUser}
    onChange={(e) => setSelectedUser(e.target.value)}
    displayEmpty
    sx={{ mr: 2 }}
  >
    <MenuItem value="">Select User</MenuItem>
    {users
      .filter((u) => u.role?.name === "user")
      .filter(
        (u) =>
          !assignments.some(
            (a) => a.user?.id === u.id && a.endDate === null
          )
      )
      .map((u) => (
        <MenuItem key={u.id} value={u.id}>
          {u.firstname} {u.surname}
        </MenuItem>
      ))}
  </Select>

  <Select
    value={selectedManager}
    onChange={(e) => setSelectedManager(e.target.value)}
    displayEmpty
    sx={{ mr: 2 }}
  >
    <MenuItem value="">Select Manager</MenuItem>
    {users
      .filter((u) => u.role?.name === "manager")
      .map((m) => (
        <MenuItem key={m.id} value={m.id}>
          {m.firstname} {m.surname}
        </MenuItem>
      ))}
  </Select>

  <Button onClick={assignManager} variant="contained">
    Assign
  </Button>
</Box>


<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>ID</TableCell>
        <TableCell>User</TableCell>
        <TableCell>Manager</TableCell>
        <TableCell>Start Date</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
   <TableBody>
  {assignments.map((a) => (
    <TableRow key={a.id}>
      <TableCell>{a.id}</TableCell>
      <TableCell>
        {a.user?.firstname} {a.user?.surname}
      </TableCell>
      <TableCell>
        {a.manager?.firstname} {a.manager?.surname}
      </TableCell>
      <TableCell>{a.startDate}</TableCell>
      <TableCell>
        <IconButton
          color="error"
          onClick={() => deleteAssignment(a.id)}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
  </Table>
</TableContainer>

      </Box>
    </Layout>
  );
};

export default ManagementPage;
