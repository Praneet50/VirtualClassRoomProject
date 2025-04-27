import { useState, useEffect, useContext } from "react";
import { Container, Card, Button, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";

function EnrollSection() {
  const { user } = useContext(AuthContext); // logged‑in user
  const [invites, setInvites] = useState({
    courses: [],
    liveClasses: [],
    quizzes: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoad] = useState(true);
  const navigate = useNavigate();

  /* ------------------------------------------------------------------ */
  /* grab “invite‑only / mine” lists                                    */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!user) return; // nothing until user ready

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [c, l, q] = await Promise.all([
          axios.get("http://localhost:5000/api/courses", config), // backend we added
          axios.get("http://localhost:5000/api/liveclasses/mine", config),
          axios.get("http://localhost:5000/api/quizzes/mine", config),
        ]);

        // hide the things I created – we only want invites
        setInvites({
          courses: c.data.filter((x) => x.creator !== user.id),
          liveClasses: l.data.filter((x) => x.user !== user.id),
          quizzes: q.data.filter((x) => x.creator !== user.id),
        });
      } catch (err) {
        console.error(err);
        setError("Could not load your invitations. Try again later.");
      } finally {
        setLoad(false);
      }
    })();
  }, [user]);
  /* ------------------------------------------------------------------ */

  /* Handle user joining a course */
  const joinCourse = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.post(
        `http://localhost:5000/api/courses/${courseId}/enroll`,
        {},
        config
      );

      // Navigate to the course display page
      navigate(`/coursedisplay/${courseId}`);
      setInvites((prevInvites) => ({
        ...prevInvites,
        courses: prevInvites.courses.filter(
          (course) => course._id !== courseId
        ),
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to join the course. Please try again later.");
    }
  };

  /* Handle user joining a live class */
  const joinLiveClass = async (liveClassId) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Navigate to the live class page
      navigate(`/liveclass/${liveClassId}`);
      setInvites((prevInvites) => ({
        ...prevInvites,
        liveClasses: prevInvites.liveClasses.filter(
          (liveClass) => liveClass._id !== liveClassId
        ),
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to join the live class. Please try again later.");
    }
  };

  /* Handle user joining a quiz */
  const joinQuiz = async (quizId) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };


      // Navigate to the quiz page
      navigate(`/quiz/${quizId}`);
      setInvites((prevInvites) => ({
        ...prevInvites,
        quizzes: prevInvites.quizzes.filter((quiz) => quiz._id !== quizId),
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to join the quiz. Please try again later.");
    }
  };

  /* quick helper to render a card list */
  const renderList = (title, list, joinFunction) => (
    <Card className="p-3 mb-3" key={title}>
      <h4 className="mb-3">{title}</h4>

      {list.length === 0 && <p className="text-muted mb-0">No invitations.</p>}

      {list.map((item) => (
        <div
          key={item._id}
          className="d-flex justify-content-between align-items-center mb-2"
        >
          <span>{item.name}</span>
          <Button
            size="sm"
            variant="success"
            onClick={() => joinFunction(item._id)} // Handle the "Join" button click
          >
            Join
          </Button>
        </div>
      ))}
    </Card>
  );

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Invitations / Enroll</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && <Spinner animation="border" />}

      {!loading && (
        <>
          {renderList("Courses", invites.courses, joinCourse)}
          {renderList("Live Classes", invites.liveClasses, joinLiveClass)}
          {renderList("Quizzes", invites.quizzes, joinQuiz)}
        </>
      )}

      {/* quick links back to your own management pages ---------------- */}
      <Card className="p-3 mt-4">
        <h5 className="mb-3">My own stuff</h5>
        <div className="d-flex gap-3 flex-wrap">
          <Link to="/courses">
            {" "}
            <Button>Manage Courses</Button>
          </Link>
          <Link to="/liveclasses">
            {" "}
            <Button>Manage Live Classes</Button>
          </Link>
          <Link to="/quizzes">
            {" "}
            <Button>Manage Quizzes</Button>
          </Link>
        </div>
      </Card>
    </Container>
  );
}

export default EnrollSection;
