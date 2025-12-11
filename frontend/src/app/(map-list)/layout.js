import Filter from "@/components/filter/Filter";
import { FilterProvider } from "@/context/FilterProvider";
import React from "react";

function MapListLayout({ children }) {
  return (
    <FilterProvider>
      <div className="space-y-4">
        <Filter />
        {children}
      </div>
    </FilterProvider>
  );
}

export default MapListLayout;
