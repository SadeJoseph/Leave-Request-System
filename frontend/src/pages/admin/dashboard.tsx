import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Typography,
  Box,
  Badge,
} from "@mui/material";

// Format date into DD/MM/YYYY
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB"); // UK format
};

// Calculate days between two dates (inclusive)
const calculateDays = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const AdminDashboard = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const token = localStorage.getItem("token");

  // Fetch requests
  const fetchRequests = async () => {
    const res = await fetch("http://localhost:8900/api/leave-requests", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const sorted = (data.data || []).sort((a: any, b: any) => {
      if (a.status === "Pending" && b.status !== "Pending") return -1;
      if (b.status === "Pending" && a.status !== "Pending") return 1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    setRequests(sorted);
    setPendingCount(sorted.filter((r: any) => r.status === "Pending").length);
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  // Update status (approve/reject)
  const handleUpdateStatus = async (id: number, status: "Approved" | "Rejected") => {
    await fetch(`http://localhost:8900/api/leave-requests/${id}/approve`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchRequests();
  };

  // reset all 
  const handleResetAllBalances = async () => {
    if (!window.confirm("Are you sure you want to reset ALL staff balances to 25 days?")) {
      return;
    }

    try {
      const res = await fetch("http://localhost:8900/api/users/reset-all-balances", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to reset balances");
      }

      alert(" All annual leave balances reset to 25!");
      fetchRequests();
    } catch (err) {
      console.error("Error resetting balances:", err);
      alert(" Error resetting balances");
    }
  };

  return (
    <Layout role="admin">
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* 🔹 Pending Requests Badge */}
        <Badge badgeContent={pendingCount} color="error">
          <Typography
            variant="h6"
            sx={{ p: 2, bgcolor: "orange", borderRadius: 2, color: "#fff" }}
          >
            Pending Requests
          </Typography>
        </Badge>

        <Button variant="contained" color="error" onClick={handleResetAllBalances}>
          Reset All Balances
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>
        All Leave Requests
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Employee ID</TableCell>
            <TableCell>Staff Name</TableCell>
            <TableCell>Leave Type</TableCell>
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>Days</TableCell>
            <TableCell>Balance</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.user?.id}</TableCell>
              <TableCell>
                {r.user?.firstname} {r.user?.surname}
              </TableCell>
              <TableCell>{r.leaveType}</TableCell>
              <TableCell>{formatDate(r.startDate)}</TableCell>
              <TableCell>{formatDate(r.endDate)}</TableCell>
              <TableCell>{calculateDays(r.startDate, r.endDate)}</TableCell>
              <TableCell>{r.user?.annualLeaveBalance ?? "-"}</TableCell>
              <TableCell>
                {r.status === "Pending" ? (
                  <Chip label="NEW" color="warning" size="small" />
                ) : r.status === "Approved" ? (
                  <Chip label="Approved" color="success" size="small" />
                ) : (
                  <Chip label="Rejected" color="error" size="small" />
                )}
              </TableCell>
              <TableCell>
                {r.status === "Pending" && (
                  <>
                    <Button
                      size="small"
                      color="success"
                      onClick={() => handleUpdateStatus(r.id, "Approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleUpdateStatus(r.id, "Rejected")}
                      sx={{ ml: 1 }}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Layout>
  );
};

export default AdminDashboard;
