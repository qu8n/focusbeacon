import { ThreeDots } from "react-loader-spinner";
import React from "react";

export function LoaderSpinner() {
  return (
    <div className="flex p-5 h-[calc(100vh-105px)]">
      <div className="m-auto mt-48">
        <ThreeDots
          visible={true}
          height="80"
          width="80"
          radius="9"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
          color="#b0bec5"
        />
      </div>
      <p className="absolute text-lg font-normal transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 text-slate-400">
        Loading...
      </p>
    </div>
  );
}
