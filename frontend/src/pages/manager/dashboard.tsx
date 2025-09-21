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

// 🔹 Format date into DD/MM/YYYY
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB");
};

// 🔹 Calculate days between two dates (inclusive)
const calculateDays = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const ManagerDashboard = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const token = localStorage.getItem("token");

  // Fetch only this manager's staff leave requests
  const fetchRequests = async () => {
    try {
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
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  // Approve / Reject
  const handleUpdateStatus = async (
    id: number,
    status: "Approved" | "Rejected"
  ) => {
    try {
      const endpoint =
        status === "Approved"
          ? `http://localhost:8900/api/leave-requests/${id}/approve`
          : `http://localhost:8900/api/leave-requests/${id}/reject`;

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      fetchRequests(); // refresh table
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <Layout role="manager">
      <Box sx={{ mb: 3 }}>
        <Badge
          badgeContent={pendingCount}
          color="error"
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          data-testid="pending-badge"
        >
          <Typography
            variant="h6"
            sx={{ p: 2, bgcolor: "orange", borderRadius: 2, color: "#fff" }}
            aria-label="Pending Requests"
          >
            Pending Requests
          </Typography>
        </Badge>
      </Box>

      <Typography variant="h5" gutterBottom data-testid="manager-dashboard-title" aria-label="My Team's Leave Requests">
        My Team's Leave Requests
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
          {requests.length > 0 ? (
            requests.map((r) => (
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
                        data-testid={`approve-button-${r.id}`}
                        aria-label="Approve Button"
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleUpdateStatus(r.id, "Rejected")}
                        sx={{ ml: 1 }}
                        data-testid={`reject-button-${r.id}`}
                          
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9}>No leave requests found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Layout>
  );
};

export default ManagerDashboard;
