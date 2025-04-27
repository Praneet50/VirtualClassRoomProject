import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Courses from "./pages/Courses";
import LiveClasses from "./pages/LiveClasses";
import Quizzes from "./pages/Quizzes";
import CourseDetail from "./pages/CourseDetail";
import LiveClassPage from "./pages/LiveClassPage";
import MySection from "./pages/My_Section";
import EnrollSection from "./pages/EnrollSection";
import QuizAttempt from "./pages/QuizAttempt";
import QuizEditor from "./pages/QuizEditor";
import CourseDisplay from "./pages/CourseDisplay";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/liveclasses" element={<LiveClasses />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/liveclass/:id" element={<LiveClassPage />} />
          <Route path="/my-section" element={<MySection />} />
          <Route path="/enroll-section" element={<EnrollSection />} />
          <Route path="/quiz/:id" element={<QuizAttempt />} />
          <Route path="/quiz/:id/edit" element={<QuizEditor />} />
          <Route path="/coursedisplay/:id" element={<CourseDisplay />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
