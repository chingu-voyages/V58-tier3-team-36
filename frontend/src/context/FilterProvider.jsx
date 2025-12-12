"use client";
import React, { createContext, useContext, useState } from "react";

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({
    gender: "",
    yearJoined: "",
    roleType: "",
    voyageRole: "",
    countries: [],
    soloProjectTier: "",
    voyageTier: "",
    voyage: "",
  });

  const [searchTrigger, setSearchTrigger] = useState(0);

  return (
    <FilterContext.Provider
      value={{ filters, setFilters, searchTrigger, setSearchTrigger }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export const useFilter = () => useContext(FilterContext);
