import React from "react";

export default function Logo() {
  return (
    <div className="mt-1 -space-y-1">
      <p className="text-3xl font-semibold">
        <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-blue-400">
          Focus
        </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-orange-400">
          Beacon
        </span>
      </p>
      <p className="text-xs font-semibold text-center text-slate-400">
        Unofficial Focusmate stats app
      </p>
    </div>
  );
}
