import { useEffect, useState } from "react";
import api from "./api";
import Toast from "./Toast";

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // studentu redagavimas
  const [editing, setEditing] = useState(null);

  // dalykai
  const [subjectsModal, setSubjectsModal] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectCredits, setNewSubjectCredits] = useState("");

  // filtrai
  const [filterId, setFilterId] = useState("");
  const [filterFirst, setFilterFirst] = useState("");
  const [filterLast, setFilterLast] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  // delete callout
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2000);
  };

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [course, setCourse] = useState("");

  const loadStudents = async () => {
    try {
      const res = await api.get("/students", {
        params: {
          id: filterId || undefined,
          firstName: filterFirst || undefined,
          lastName: filterLast || undefined,
          course: filterCourse || undefined,
        },
      });

      setStudents(res.data);
    } catch (err) {
      setError("Nepavyko gauti studentų");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const createStudent = async (e) => {
    e.preventDefault();

    try {
      await api.post("/students", {
        firstName,
        lastName,
        course: Number(course),
      });

      setFirstName("");
      setLastName("");
      setCourse("");

      loadStudents();
      showToast("Studentas sukurtas", "success");
    } catch (err) {
      showToast("Klaida kuriant studentą", "error");
    }
  };

  const deleteStudent = async (id) => {
    if (!confirm("Ar tikrai nori ištrinti studentą?")) return;

    try {
      await api.delete(`/students/${id}`);
      loadStudents();
      showToast("Studentas ištrintas", "success");
    } catch (err) {
      showToast("Nepavyko ištrinti studento", "error");
    }
  };

  const saveEdit = async () => {
    try {
      await api.put(`/students/${editing.id}`, {
        firstName: editing.first_name,
        lastName: editing.last_name,
        course: editing.course,
      });

      setEditing(null);
      loadStudents();
      showToast("Studentas atnaujintas", "success");
    } catch (err) {
      showToast("Nepavyko atnaujinti studento", "error");
    }
  };

  // SUBJECTS LOGIC
  const openSubjects = async (student) => {
    setSubjectsModal(student);

    try {
      const res = await api.get(`/subjects/${student.id}/subjects`);
      setSubjects(res.data);
    } catch (err) {
      showToast("Nepavyko gauti dalykų", "error");
    }
  };

  const addSubject = async () => {
    try {
      const res = await api.post(`/subjects/${subjectsModal.id}`, {
        name: newSubjectName,
        credits: Number(newSubjectCredits),
      });

      setSubjects([...subjects, res.data]);
      setNewSubjectName("");
      setNewSubjectCredits("");
      showToast("Dalykas pridėtas", "success");
    } catch (err) {
      showToast("Nepavyko pridėti dalyko", "error");
    }
  };

  const removeSubject = async (subjectId) => {
    try {
      await api.delete(`/subjects/${subjectsModal.id}/subjects/${subjectId}`);

      setSubjects(subjects.filter((s) => s.id !== subjectId));
      showToast("Dalykas pašalintas", "success");
    } catch (err) {
      showToast("Nepavyko pašalinti dalyko", "error");
    }
  };

  if (loading) return <p>Kraunama...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <h1 >Studentų registras</h1>
      <h2>Filtruoti pagal</h2>
      <div
  style={{
    background: "white",
    padding: "16px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "20px",
    display: "flex",
    gap: "12px",
    alignItems: "center",
  }}
>
  <input
    type="number"
    placeholder="🔎 ID"
    value={filterId}
    onChange={(e) => setFilterId(e.target.value)}
    style={{
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      flex: "1",
    }}
  />

  <input
    type="text"
    placeholder="👤 Vardas"
    value={filterFirst}
    onChange={(e) => setFilterFirst(e.target.value)}
    style={{
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      flex: "1",
    }}
  />

  <input
    type="text"
    placeholder="👤 Pavardė"
    value={filterLast}
    onChange={(e) => setFilterLast(e.target.value)}
    style={{
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      flex: "1",
    }}
  />

  <input
    type="number"
    placeholder="🎓 Kursas"
    value={filterCourse}
    onChange={(e) => setFilterCourse(e.target.value)}
    style={{
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      width: "120px",
    }}
  />

<button
    onClick={loadStudents}
    style={{
      padding: "8px 14px",
      background: "#4caf50",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Filtruoti
  </button>

  <button
    onClick={() => {
      setFilterId("");
      setFilterFirst("");
      setFilterLast("");
      setFilterCourse("");
    }}
    style={{
      padding: "8px 14px",
      background: "#f44336",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    }}
  >
    Išvalyti
  </button>
</div>


<h2>Studentų sąrašas</h2>
      {/* EDIT STUDENT MODAL */}
      {editing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "300px",
            }}
          >
            <h3>Redaguoti studentą</h3>

            <input
              type="text"
              value={editing.first_name}
              onChange={(e) =>
                setEditing({ ...editing, first_name: e.target.value })
              }
            />

            <input
              type="text"
              value={editing.last_name}
              onChange={(e) =>
                setEditing({ ...editing, last_name: e.target.value })
              }
            />

            <input
              type="number"
              value={editing.course}
              onChange={(e) =>
                setEditing({ ...editing, course: Number(e.target.value) })
              }
            />

            <button onClick={saveEdit}>Išsaugoti</button>
            <button onClick={() => setEditing(null)}>Atšaukti</button>
          </div>
        </div>
      )}

      {/* SUBJECTS MODAL */}
      {subjectsModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>
              Dalykai studentui: {subjectsModal.first_name}{" "}
              {subjectsModal.last_name}
            </h3>

            {subjects.length === 0 ? (
              <p>Nėra dalykų</p>
            ) : (
              <table border="1" cellPadding="6" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Pavadinimas</th>
                    <th>Kreditai</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subj) => (
                    <tr key={subj.id}>
                      <td>{subj.name}</td>
                      <td>{subj.credits}</td>
                      <td>
                        <button onClick={() => removeSubject(subj.id)}>
                          Pašalinti
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h4>Pridėti naują dalyką</h4>

            <input
              type="text"
              placeholder="Pavadinimas"
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Kreditai"
              value={newSubjectCredits}
              onChange={(e) => setNewSubjectCredits(e.target.value)}
            />

            <button onClick={addSubject}>Pridėti</button>

            <br />
            <button onClick={() => setSubjectsModal(null)}>Uždaryti</button>
          </div>
        </div>
      )}

      {/* STUDENTS TABLE */}
      {students.length === 0 ? (
        <p>Nėra studentų</p>
      ) : (
        <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  }}
>
  <thead>
    <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
      <th style={{ padding: "12px" }}>ID</th>
      <th style={{ padding: "12px" }}>Vardas</th>
      <th style={{ padding: "12px" }}>Pavardė</th>
      <th style={{ padding: "12px" }}>Kursas</th>
      <th style={{ padding: "12px" }}>Veiksmai</th>
    </tr>
  </thead>

  <tbody>
    {students.map((s, index) => (
      <tr
        key={s.id}
        style={{
          background: index % 2 === 0 ? "#ffffff" : "#fafafa",
          borderBottom: "1px solid #eee",
        }}
      >
        <td style={{ padding: "12px" }}>{s.id}</td>
        <td style={{ padding: "12px" }}>{s.first_name}</td>
        <td style={{ padding: "12px" }}>{s.last_name}</td>
        <td style={{ padding: "12px" }}>{s.course}</td>

        <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
          <button
            onClick={() => setEditing(s)}
            style={{
              padding: "6px 10px",
              background: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Redaguoti
          </button>

          <button
            onClick={() => deleteStudent(s.id)}
            style={{
              padding: "6px 10px",
              background: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Ištrinti
          </button>

          <button
            onClick={() => openSubjects(s)}
            style={{
              padding: "6px 10px",
              background: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Dalykai
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

      )}

      <h2 style={{ textAlign: "center", marginTop: "40px" }}>Pridėti studentą</h2>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
  }}
>
  <div
    style={{
      background: "white",
      padding: "20px",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      width: "350px",
    }}
  >
    <form
      onSubmit={createStudent}
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ marginBottom: "4px", fontWeight: "500" }}>Vardas</label>
        <input
          type="text"
          placeholder="Įveskite vardą"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ marginBottom: "4px", fontWeight: "500" }}>Pavardė</label>
        <input
          type="text"
          placeholder="Įveskite pavardę"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ marginBottom: "4px", fontWeight: "500" }}>Kursas</label>
        <input
          type="number"
          placeholder="1–6"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          required
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          padding: "10px",
          background: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600",
          marginTop: "10px",
        }}
      >
        Sukurti
      </button>
    </form>
  </div>
</div>
</div>
  );
}

export default App;
