import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Typography,
  Box,
  Badge,
} from "@mui/material";

// 🔹 Format date into DD/MM/YYYY
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB");
};

// 🔹 Calculate days between dates (Mon–Fri only)
const calculateDays = (start: string, end: string) => {
  let count = 0;
  let current = new Date(start);
  const endDate = new Date(end);

  while (current <= endDate) {
    const day = current.getDay(); // 0 = Sun, 6 = Sat
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
};

const EmployeeDashboard = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8900/api/leave-requests/mine", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const sorted = (data.data || []).sort((a: any, b: any) => {
          if (a.status === "Pending" && b.status !== "Pending") return -1;
          if (b.status === "Pending" && a.status !== "Pending") return 1;
          return (
            new Date(b.startDate).getTime() -
            new Date(a.startDate).getTime()
          );
        });

        setRequests(sorted);
        setPendingCount(sorted.filter((r: any) => r.status === "Pending").length);
      })
      .catch((err) => console.error("Error fetching requests:", err));
  }, []);

  return (
    <Layout role="employee">
      <Box sx={{ mb: 3 }}>
        <Badge badgeContent={pendingCount} color="error">
          <Typography
            variant="h6"
            sx={{ p: 2, bgcolor: "orange", borderRadius: 2, color: "#fff" }}
          >
            My Leave Requests
          </Typography>
        </Badge>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Leave Type</TableCell>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>Days</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.length > 0 ? (
            requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.leaveType}</TableCell>
                <TableCell>{formatDate(r.startDate)}</TableCell>
                <TableCell>{formatDate(r.endDate)}</TableCell>
                <TableCell>{calculateDays(r.startDate, r.endDate)}</TableCell>
                <TableCell>
                  {r.status === "Pending" ? (
                    <Chip label="NEW" color="warning" size="small" />
                  ) : r.status === "Approved" ? (
                    <Chip label="Approved" color="success" size="small" />
                  ) : (
                    <Chip label="Rejected" color="error" size="small" />
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>No leave requests found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Layout>
  );
};

export default EmployeeDashboard;
