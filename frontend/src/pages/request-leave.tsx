import React from "react";
import Layout from "../components/Layout";
import RequestLeaveForm from "../components/RequestLeaveForm";

const RequestLeavePage = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = localStorage.getItem("role") as "manager" | "employee" | null;

  if (!role || (role !== "manager" && role !== "employee")) {
    return <div>Not authorized</div>;
  }

  return (
    <Layout role={role}>
      <RequestLeaveForm />
    </Layout>
  );
};

export default RequestLeavePage;
