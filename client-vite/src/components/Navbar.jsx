import { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import ThemeContext from "../context/ThemeContext"; // Correct import here
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";

function AppNavbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <Navbar
      bg={theme === "light" ? "light" : "dark"}
      variant={theme === "light" ? "light" : "dark"}
      expand="lg"
      className="mb-4"
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          Virtual Classroom
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user ? (
              <>
                <Nav.Link as={Link} to="/my-section">
                  My Section
                </Nav.Link>
                <Nav.Link as={Link} to="/enroll-section">
                  Enrolling Section
                </Nav.Link>
              </>
            ) : null}
          </Nav>

          <Nav className="align-items-center">
            {/* 🌗 Theme toggle button */}
            <Button
              variant={theme === "light" ? "outline-dark" : "outline-light"}
              size="sm"
              onClick={toggleTheme}
              className="me-3"
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </Button>

            {user ? (
              <>
                <NavDropdown
                  title={user.name}
                  id="basic-nav-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
