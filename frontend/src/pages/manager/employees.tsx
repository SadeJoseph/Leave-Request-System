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
} from "@mui/material";
import Layout from "../../components/Layout";

const ManagerEmployeesPage = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:8900/api/user-management", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

  
     setEmployees(json.data?.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token]);

  return (
    <Layout role="manager">
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          My Team
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Start Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {employees.length > 0 ? (
    employees.map((a: any) => (
      <TableRow key={a.id}>
        <TableCell>{a.user?.id}</TableCell>
        <TableCell>
          {a.user?.firstname} {a.user?.surname}
        </TableCell>
        <TableCell>{a.user?.email}</TableCell>
        <TableCell>{a.user?.role?.name}</TableCell>
        <TableCell>{a.user?.department?.name}</TableCell>
        <TableCell>{a.startDate}</TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={6} align="center">
        No employees assigned
      </TableCell>
    </TableRow>
  )}
</TableBody>

          </Table>
        </TableContainer>
      </Box>
    </Layout>
  );
};

export default ManagerEmployeesPage;
