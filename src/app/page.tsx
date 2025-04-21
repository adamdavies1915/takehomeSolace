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
    const controller = new AbortController();

    fetch("/api/advocates", { signal: controller.signal })
      .then((response) => response.json())
      .then((jsonResponse) => {
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));

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
    const result = advocates.filter((adv) =>
      [
        adv.firstName,
        adv.lastName,
        adv.city,
        adv.degree,
        adv.yearsOfExperience.toString(),
        ...(adv.specialties),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
    setFilteredAdvocates(result);
  }, [searchTerm, advocates]);

  /* ------------------------------------------------------------------
   * CLASSES
   * ----------------------------------------------------------------*/
  const pageClasses =
    "p-6 bg-gray-50 dark:bg-gray-900 min-h-screen w-full";

  /* ------------------------------------------------------------------
   * RENDER EARLY STATES
   * ----------------------------------------------------------------*/
  if (loading)
    return <p className={`${pageClasses} text-gray-700`}>Loading…</p>;
  if (error)
    return (
      <p className={`${pageClasses} text-red-600`}>Error: {error}</p>
    );

  /* ------------------------------------------------------------------
   * RENDER
   * ----------------------------------------------------------------*/
  return (
    <main className={pageClasses}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Solace Advocates
        </h1>

        {/* -------------------- Search UI -------------------- */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="sr-only" htmlFor="search">
            Search advocates
          </label>
          <input
            id="search"
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to filter advocates…"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            >
              Reset
            </button>
          )}
        </div>

        {/* -------------------- Data Table -------------------- */}
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  First Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Last Name
                </th>
                <th scope="col" className="px-6 py-3">
                  City
                </th>
                <th scope="col" className="px-6 py-3">
                  Degree
                </th>
                <th scope="col" className="px-6 py-3">
                  Specialties
                </th>
                <th scope="col" className="px-6 py-3">
                  Years Exp.
                </th>
                <th scope="col" className="px-6 py-3">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAdvocates.map((adv, idx) => (
                <tr
                  key={adv.id}
                  className={`border-b dark:border-gray-700 ${
                    idx % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-900"
                  }`}
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {adv.firstName}
                  </th>
                  <td className="px-6 py-4">{adv.lastName}</td>
                  <td className="px-6 py-4">{adv.city}</td>
                  <td className="px-6 py-4">{adv.degree}</td>
                  <td className="px-6 py-4 space-y-1">
                    {adv.specialties.map((s) => (
                      <div key={s}>{s}</div>
                    ))}
                  </td>
                  <td className="px-6 py-4">{adv.yearsOfExperience}</td>
                  <td className="px-6 py-4">{adv.phoneNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
