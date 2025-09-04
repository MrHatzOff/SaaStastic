"use client";

import { useCompany } from "@/core/auth/CompanyContext";

export default function CompanySwitcher() {
    const { company, setCompany, companies } = useCompany();

    return (
        <div className="flex items-center space-x-2">
            <label htmlFor="company" className="text-sm font-medium">
                Company:
            </label>
            <select
                id="company"
                value={company?.id}
                onChange={(e) => {
                    const selected = companies.find((c) => c.id === e.target.value);
                    if (selected) setCompany(selected);
                }}
                className="border rounded-md p-1 text-sm bg-white"
            >
                {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
