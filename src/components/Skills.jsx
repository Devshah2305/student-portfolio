function Skills({ skills }) {
  return (
    <section className="card">
      <p className="card-label">Skills</p>
      {skills.map((group) => (
        <div key={group.category} className="skill-group">
          <p className="skill-category">{group.category}</p>
          <ul className="skill-list">
            {group.items.map((skill) => (
              <li key={skill} className="skill-pill">{skill}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export default Skills;