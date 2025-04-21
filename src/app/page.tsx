"use client";

import { useEffect, useState } from "react";

interface Advocate {
  id: string; // react key
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: string;
}

export default function Home() {
  /* ------------------------------------------------------------------
   * STATE
   * ----------------------------------------------------------------*/
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------------
   * DATA‑FETCHING
   * ----------------------------------------------------------------*/
  useEffect(() => {
    console.log("fetching advocates…");
    const controller = new AbortController();

    fetch("/api/advocates", { signal: controller.signal })
      .then((response) => response.json())
      .then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));

    // Abort fetch if the component unmounts
    return () => controller.abort();
  }, []);

  /* ------------------------------------------------------------------
   * SEARCH FILTERING
   * ----------------------------------------------------------------*/
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAdvocates(advocates);
      return;
    }

    const term = searchTerm.toLowerCase();

    const result = advocates.filter((advocates) => {
      const searchableContent = [
      advocates.firstName,
      advocates.lastName,
      advocates.city,
      advocates.degree,
      advocates.yearsOfExperience.toString(),
      ...(advocates.specialties),
      ]
      .join(" ")
      .toLowerCase();

      return searchableContent.includes(term);
    });

    setFilteredAdvocates(result);
  }, [searchTerm, advocates]);

  /* ------------------------------------------------------------------
   * RENDER
   * ----------------------------------------------------------------*/
  if (loading) return <p style={{ margin: "24px" }}>Loading…</p>;
  if (error) return <p style={{ margin: "24px", color: "red" }}>{error}</p>;

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>

      {/* -------------------- Search UI -------------------- */}
      <div style={{ margin: "16px 0" }}>
        <label>
          Search
          <input
            style={{ border: "1px solid black", marginLeft: 8 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
        {searchTerm && (
          <button onClick={() => setSearchTerm("")}
            style={{ marginLeft: 8 }}>
            Reset
          </button>
        )}
      </div>

      {/* -------------------- Data Table -------------------- */}
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>City</th>
            <th>Degree</th>
            <th>Specialties</th>
            <th>Years of Experience</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdvocates.map((advocate) => (
            <tr key={advocate.id}>
              <td>{advocate.firstName}</td>
              <td>{advocate.lastName}</td>
              <td>{advocate.city}</td>
              <td>{advocate.degree}</td>
              <td>
                {advocate.specialties.map((s) => (
                  <div key={s}>{s}</div>
                ))}
              </td>
              <td>{advocate.yearsOfExperience}</td>
              <td>{advocate.phoneNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
