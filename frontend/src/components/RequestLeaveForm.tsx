import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
} from "@mui/material";

const RequestLeaveForm = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [days, setDays] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const token = localStorage.getItem("token");

  const today = new Date().toISOString().split("T")[0];

  // Helper: count weekdays between two dates
  const calculateWeekdays = (start: string, end: string): number => {
    const startDt = new Date(start);
    const endDt = new Date(end);
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) return 0;

    let count = 0;
    const cur = new Date(startDt);

    while (cur <= endDt) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) {
        // 0 = Sunday, 6 = Saturday
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  // Recalculate days whenever dates change
  useEffect(() => {
    if (startDate && endDate) {
      setDays(calculateWeekdays(startDate, endDate));
    } else {
      setDays(0);
    }
  }, [startDate, endDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!startDate || !endDate || !reason) {
      setError("All fields are required");
      return;
    }

    if (days <= 0) {
      setError("End date must be after start date and include weekdays");
      return;
    }

    try {
      const res = await fetch("http://localhost:8900/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate,
          endDate,
          reason,
          leaveType: "Annual Leave",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || "Failed to request leave");
      }

      setSuccess("Leave request submitted successfully");
      setStartDate("");
      setEndDate("");
      setReason("");
      setDays(0);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 400, mx: "auto", mt: 4 }}
      data-testid="request-leave-form"
      aria-label="Request Leave Form" 
    >
      <Typography variant="h5" gutterBottom>
        Request Leave
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      <TextField
        fullWidth
        margin="normal"
        label="Start Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: today }}
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        data-testid="start-date-input"
        aria-label="Start Date Input" 
      />

      <TextField
        fullWidth
        margin="normal"
        label="End Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: startDate || today }}
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        data-testid="end-date-input"
        aria-label="End Date Input" 
      />

      {/* Show live calculated weekdays */}
      {days > 0 && (
        <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
          Total Days (Mon-Fri): <strong>{days}</strong>
        </Typography>
      )}

      <TextField
        fullWidth
        margin="normal"
        label="Reason"
        multiline
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)
        }
        data-testid="reason-input"
        aria-label="Reason Input" 
      />

      <Select fullWidth value="Annual Leave" disabled sx={{ mt: 2, mb: 2 }} data-testid="leave-type-select" aria-label="Leave Type Select"> 
        <MenuItem value="Annual Leave">Annual Leave</MenuItem>
      </Select>

      <Button type="submit" variant="contained" color="primary" fullWidth data-testid="submit-request" aria-label="Submit Request Button">
        Submit Request
      </Button>
    </Box>
  );
};

export default RequestLeaveForm;
