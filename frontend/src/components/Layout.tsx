import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  ListItemButton,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { navigate } from "gatsby";

interface LayoutProps {
  children: React.ReactNode;
  role: "admin" | "manager" | "employee";
}

const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavClick = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");  
    navigate("/login");                
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {role.toUpperCase()}
          </Typography>
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
<Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
  <Box sx={{ width: 240 }} role="presentation">
    {/* Push content down (same height as AppBar) */}
    <Toolbar />

    <List>
      <ListItem disablePadding>
        <ListItemButton onClick={() => handleNavClick(`/${role}/dashboard`)}>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
      </ListItem>

      {(role === "admin" || role === "manager") && (
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavClick(`/${role}/employees`)}>
            <ListItemText primary="Employees" />
          </ListItemButton>
        </ListItem>
      )}

{(role === "manager" || role === "employee") && (
  <ListItem disablePadding>
    <ListItemButton onClick={() => handleNavClick(`/request-leave`)}>
      <ListItemText primary="Request Leave" />
    </ListItemButton>
  </ListItem>
)}

      {role === "admin" && (
    <ListItem disablePadding>
      <ListItemButton onClick={() => handleNavClick(`/${role}/management`)}>
        <ListItemText primary="Management" />
      </ListItemButton>
    </ListItem>
  )}
    </List>
  </Box>
</Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
