import { ThreeDots } from "react-loader-spinner";
import React from "react";

export default function LoaderSpinner() {
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
    </div>
  );
}
