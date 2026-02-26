"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, defaultTab, onChange }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  const handleClick = (id: string) => {
    setActive(id);
    onChange(id);
  };

  return (
    <div className="flex gap-1 rounded-lg bg-rinfo-100/60 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleClick(tab.id)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
            active === tab.id
              ? "bg-white text-rinfo-800 shadow-sm"
              : "text-rinfo-600 hover:text-rinfo-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
