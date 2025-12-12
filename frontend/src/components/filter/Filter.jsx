"use client"
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import MultipleSelectCountry from "../shadcn-studio/select/select-32";
import { useFilter } from "@/context/FilterProvider";

function Filter() {
  
  const {filters,setFilters} = useFilter();

  // Generate years and voyages
  const yearsOfJoin = Array.from({ length: 16 }, (_, i) => 2010 + i);
  const voyages = Array.from({ length: 33 }, (_, i) => ({
    value: `V${i + 26}`,
    label: `Voyage${i + 26}`,
  }));

  // Handle regular select changes
  const handleSelectChange = (name) => (value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  //  MultipleSelectCountry
  const handleCountriesChange = (selectedCountries) => {
    setFilters((prev) => ({ ...prev, countries: selectedCountries.map(itm=>itm.value) }));
  };

  // Handle Search Button
  const handleSearch = () => {
    console.log("Current filter values:", filters);
  };

  const handleClear = () => {
    setFilters({
      gender: "",
      yearJoined: "",
      roleType: "",
      voyageRole: "",
      countries: [],
      soloProjectTier: "",
      voyageTier: "",
      voyage: "",
    });
  };

  const isAnyFilterApplied = () => {
  return (
    filters.gender ||
    filters.yearJoined ||
    filters.roleType ||
    filters.voyageRole ||
    filters.countries.length > 0 ||
    filters.soloProjectTier ||
    filters.voyageTier ||
    filters.voyage
  );
};

  return (
    <div className="p-2 grid sm:grid-cols-3 grid-cols-2 gap-3">
      {/* Gender */}
      <div>
        <label className="text-sm">Gender</label>
        <Select
          value={filters.gender}
          onValueChange={handleSelectChange("gender")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select options" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Year of join */}
      <div>
        <label className="text-sm">Year of joining</label>
        <Select value={filters.yearJoined} onValueChange={handleSelectChange("yearJoined")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select year of join" />
          </SelectTrigger>
          <SelectContent>
            {yearsOfJoin.map((itm, ind) => (
              <SelectItem key={ind} value={String(itm)}>
                {itm}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Role type */}
      <div>
       <label className="text-sm">Role Type</label>
        <Select value={filters.roleType} onValueChange={handleSelectChange("roleType")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select options" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="web">Web</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="N/A">Not Available</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Voyage Role */}
      <div>
       <label className="text-sm">Voyage Role</label>
        <Select value={filters.voyageRole} onValueChange={handleSelectChange("voyageRole")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select options" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="designer">UI/UX Designer</SelectItem>
            <SelectItem value="product owner">Product Owner</SelectItem>
            <SelectItem value="Scrum master">Scrum Master</SelectItem>
            <SelectItem value="Data Scientist">Data Scientist</SelectItem>
            <SelectItem value="N/A">Not available</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Country Code Multiple Select */}
      <MultipleSelectCountry handleCountriesChange={handleCountriesChange} />

      {/* Solo Project Tier */}
      <div>
       <label className="text-sm">Solo Project Tier</label>
        <Select value={filters.soloProjectTier} onValueChange={handleSelectChange("soloProjectTier")}>  <SelectTrigger className="w-full">
            <SelectValue placeholder="Select options" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tier 1">
              Tier 1 - HTML - Basic Javascript - Basic Algorithms (LANDING
              PAGES)
            </SelectItem>
            <SelectItem value="tier 2">
              Tier 2 - Intermediate Algorithms - Front-end Projects (FRONT-END)
            </SelectItem>
            <SelectItem value="tier 3">
              Tier 3 - Advanced Projects - Apps having both Front-end and
              Back-end
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* voyageTier */}
      <div>
        <label className="text-sm">Voyage Tier</label>
        <Select value={filters.voyageTier} onValueChange={handleSelectChange("voyageTier")}>  <SelectTrigger className="w-full">
            <SelectValue placeholder="Select options" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tier 1">Tier 1</SelectItem>
            <SelectItem value="tier 2">Tier 2</SelectItem>
            <SelectItem value="tier 3">Tier 3</SelectItem>
            <SelectItem value="bears">Bears</SelectItem>
            <SelectItem value="geckos">Geckos</SelectItem>
            <SelectItem value="toucans">Toucans</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Voyage */}
      <div>
       <label className="text-sm">Voyage</label>
        <Select value={filters.voyage} onValueChange={handleSelectChange("voyage")}> <SelectTrigger className="w-full">
            <SelectValue placeholder="Select options" />
          </SelectTrigger>
          <SelectContent>
            {voyages.map((itm, ind) => (
              <SelectItem key={ind} value={itm.value}>
                {itm.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="max-sm:hidden" />

      <div className="max-sm:col-span-2 gap-2 grid grid-cols-3">
        <button disabled={!isAnyFilterApplied()} onClick={handleSearch} className="rounded-sm bg-green-50 cursor-pointer hover:scale-101 p-2 text-center border">
          Search
        </button>
       
        <button onClick={handleClear} className="rounded-sm bg-amber-100 cursor-pointer hover:scale-101 p-2 text-center border">
          Clear
        </button>
      </div>
    </div>
  );
}

export default Filter;
