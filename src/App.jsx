
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar";
import Footer from "./components/Footer";
import "./App.css";

// Lazy-loaded route components
const Home = lazy(() => import("./pages/Home"));
const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));

// Loading fallback UI
function Loading() {
  return (
    <div className="spinner-wrap">
      <div className="spinner"></div>
      <p className="spinner-text">Loading page, please wait...</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <NavBar />

        <main className="page-content">
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </Suspense>
        </main>

        <Footer
          github="https://github.com/Devshah2305"
          linkedin="https://www.linkedin.com/in/devshah2305"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
