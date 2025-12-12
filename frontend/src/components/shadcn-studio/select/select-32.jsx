"use client";
import { api } from "@/api/axiosInstance";
import { Label } from "@/components/ui/label";
import MultipleSelector from "@/components/ui/multi-select";
import { useEffect, useState } from "react";

const MultipleSelectCountry = ({handleCountriesChange}) => {
  const [countries, setCountries] = useState([]);

  const getCountries = async (q) => {
    const { data } = await api.get(`/api/country/codes?q=${q}`);

    return data?.map(({ countryName, countryCode }) => ({
      label: `${countryName} (${countryCode})`,
      value: countryCode,
    }));
  };

  useEffect(() => {
    getCountries();
  }, []);

  
  return (
    <div className="w-full  space-y-2">
      <Label>Select Country or Country Code</Label>
      <MultipleSelector
        commandProps={{
          label: "Select Country",
        }}
        // options={countries}
        onSearch={getCountries}
        value={countries}
        onChange={handleCountriesChange}
        placeholder="Select country"
        hideClearAllButton
        hidePlaceholderWhenSelected
        emptyIndicator={<p className="text-center text-sm">No results found</p>}
        className="w-full"
      />
    </div>
  );
};

export default MultipleSelectCountry;
