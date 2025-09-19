// src/pages/index.tsx
import React, { useEffect } from "react";
import { navigate } from "gatsby";

const IndexPage = () => {
  useEffect(() => {
    navigate("/login");
  }, []);

  return null; 
};

export default IndexPage;
