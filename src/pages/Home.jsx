import About from "../components/About";
import Skills from "../components/Skills";

const skills = [
  {
    category: "Languages",
    items: ["Python", "JavaScript", "SQL", "HTML / CSS"],
  },
  {
    category: "AI & LLM Engineering",
    items: ["LangChain", "Ollama", "ChromaDB", "RAG Systems", "Prompt Engineering", "Agent Orchestration"],
  },
  {
    category: "Web Development",
    items: ["React", "Vite", "Node.js", "Streamlit", "REST APIs"],
  },
  {
    category: "Data & ML",
    items: ["Pandas", "NumPy", "Scikit-learn", "XGBoost", "Power BI"],
  },
  {
    category: "Tools",
    items: ["Git", "GitHub", "VS Code", "Jupyter", "SQLite"],
  },
];

function Home() {
  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <p className="hero-eyebrow">Portfolio · 2025</p>
        <h1 className="hero-name">
          Dev Shah
        </h1>
        <p className="hero-role">AI Engineer &amp; CS Student</p>
        <p className="hero-uni">DEPSTAR, CVM University — Ahmedabad</p>
        <div className="hero-divider" />
        <p className="hero-tagline">
          Building intelligent systems end-to-end — from LLM agents and RAG
          pipelines to full-stack web products.
        </p>
      </div>

      <About />
      <Skills skills={skills} />
    </div>
  );
}

export default Home;