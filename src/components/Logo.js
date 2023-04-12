import React from "react";

export default function Logo() {
  return (
    <div className="-space-y-1 mt-1">
      <p className="font-semibold text-3xl">
        <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-blue-400">
          Focus
        </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-orange-400">
          Beacon
        </span>
      </p>
      <p className="font-medium text-xs text-slate-400">
        Unofficial Focusmate Stats App
      </p>
    </div>
  );
}
