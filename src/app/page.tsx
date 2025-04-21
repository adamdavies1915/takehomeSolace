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

interface Filters {
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[]; // Array for multiple specialty selections
  yearsOfExperience: string;
}

export default function Home() {
  /* ------------------------------------------------------------------
   * STATE
   * ----------------------------------------------------------------*/
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [filters, setFilters] = useState<Filters>({
    firstName: "",
    lastName: "",
    city: "",
    degree: "",
    specialties: [],
    yearsOfExperience: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [specialtyOptions, setSpecialtyOptions] = useState<string[]>([]);

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
   * SPECIALTY OPTIONS EXTRACTION
   * ----------------------------------------------------------------*/
  useEffect(() => {
    if (advocates.length > 0) {
      const uniqueSpecialties = Array.from(
        new Set(
          advocates.flatMap((adv) => adv.specialties)
        )
      ).sort();
      setSpecialtyOptions(uniqueSpecialties);
    }
  }, [advocates]);

  /* ------------------------------------------------------------------
   * FILTER MANAGEMENT
   * ----------------------------------------------------------------*/
  const handleFilterChange = (field: keyof Filters, value: string | string[]) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecialtyChange = (specialty: string) => {
    setFilters((prev) => {
      // If specialty is already selected, remove it
      if (prev.specialties.includes(specialty)) {
        return {
          ...prev,
          specialties: prev.specialties.filter(s => s !== specialty)
        };
      } 
      // Otherwise add it to the selected specialties
      else {
        return {
          ...prev,
          specialties: [...prev.specialties, specialty]
        };
      }
    });
  };

  const resetFilters = () => {
    setFilters({
      firstName: "",
      lastName: "",
      city: "",
      degree: "",
      specialties: [],
      yearsOfExperience: "",
    });
  };

  const isAnyFilterActive = 
    Object.entries(filters).some(([key, value]) => {
      if (key === "specialties") {
        return (value as string[]).length > 0;
      }
      return value !== "";
    });

  /* ------------------------------------------------------------------
   * SEARCH FILTERING
   * ----------------------------------------------------------------*/
  useEffect(() => {
    let result = [...advocates];

    // Apply filters one by one
    if (filters.firstName) {
      const term = filters.firstName.toLowerCase();
      result = result.filter((adv) => 
        adv.firstName.toLowerCase().includes(term)
      );
    }

    if (filters.lastName) {
      const term = filters.lastName.toLowerCase();
      result = result.filter((adv) => 
        adv.lastName.toLowerCase().includes(term)
      );
    }

    if (filters.city) {
      const term = filters.city.toLowerCase();
      result = result.filter((adv) => 
        adv.city.toLowerCase().includes(term)
      );
    }

    if (filters.degree) {
      const term = filters.degree.toLowerCase();
      result = result.filter((adv) => 
        adv.degree.toLowerCase().includes(term)
      );
    }

    if (filters.specialties.length > 0) {
      result = result.filter((adv) => 
        // Return advocates that have ANY of the selected specialties
        filters.specialties.some(specialty => 
          adv.specialties.includes(specialty)
        )
      );
    }

    if (filters.yearsOfExperience) {
      // For years of experience, we filter for advocates with AT LEAST the specified years
      const years = parseInt(filters.yearsOfExperience, 10);
      if (!isNaN(years)) {
        result = result.filter((adv) => adv.yearsOfExperience >= years);
      }
    }

    setFilteredAdvocates(result);
  }, [filters, advocates]);

  /* ------------------------------------------------------------------
   * CLASSES
   * ----------------------------------------------------------------*/
  const pageClasses =
    "p-6 bg-gray-50 dark:bg-gray-900 min-h-screen w-full";
  const inputClasses = 
    "w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100";

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

        {/* -------------------- Search Filters -------------------- */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="mb-3 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Filter Advocates
            </h2>
            {isAnyFilterActive && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300"
              >
                Reset All Filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* First Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                className={inputClasses}
                value={filters.firstName}
                onChange={(e) => handleFilterChange("firstName", e.target.value)}
                placeholder="Filter by first name..."
              />
            </div>
            
            {/* Last Name Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                className={inputClasses}
                value={filters.lastName}
                onChange={(e) => handleFilterChange("lastName", e.target.value)}
                placeholder="Filter by last name..."
              />
            </div>
            
            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="city">
                City
              </label>
              <input
                id="city"
                className={inputClasses}
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                placeholder="Filter by city..."
              />
            </div>
            
            {/* Degree Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="degree">
                Degree
              </label>
              <input
                id="degree"
                className={inputClasses}
                value={filters.degree}
                onChange={(e) => handleFilterChange("degree", e.target.value)}
                placeholder="Filter by degree..."
              />
            </div>
            
            {/* Years Experience Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="yearsOfExperience">
                Minimum Years of Experience
              </label>
              <input
                id="yearsOfExperience"
                type="number"
                min="0"
                className={inputClasses}
                value={filters.yearsOfExperience}
                onChange={(e) => handleFilterChange("yearsOfExperience", e.target.value)}
                placeholder="Min. years required..."
              />
            </div>
          </div>
          
          {/* Specialty Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Specialties
            </label>
            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-12 dark:bg-gray-800">
              {specialtyOptions.map((specialty) => (
                <div 
                  key={specialty}
                  onClick={() => handleSpecialtyChange(specialty)}
                  className={`
                    px-3 py-1 rounded-full text-sm cursor-pointer transition-colors
                    ${filters.specialties.includes(specialty) 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}
                  `}
                >
                  {specialty}
                </div>
              ))}
              {specialtyOptions.length === 0 && (
                <div className="text-gray-500 dark:text-gray-400 italic p-2">
                  Loading specialties...
                </div>
              )}
            </div>
            {filters.specialties.length > 0 && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {filters.specialties.length} {filters.specialties.length === 1 ? 'specialty' : 'specialties'} selected
              </div>
            )}
          </div>
        </div>

        {/* -------------------- Results Count -------------------- */}
        <div className="mb-4 text-gray-700 dark:text-gray-300">
          Showing {filteredAdvocates.length} of {advocates.length} advocates
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
              {filteredAdvocates.length > 0 ? (
                filteredAdvocates.map((adv, idx) => (
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
                ))
              ) : (
                <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td colSpan={7} className="px-6 py-4 text-center">
                    No advocates found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
