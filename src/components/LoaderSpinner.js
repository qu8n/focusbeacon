import { Comment } from "react-loader-spinner";
import React from "react";

export default function LoaderSpinner() {
  return (
    <div className="flex p-5 h-[calc(100vh-105px)]">
      <div className="m-auto mt-48">
        <Comment
          visible={true}
          height="80"
          width="80"
          ariaLabel="comment-loading"
          wrapperStyle={{}}
          wrapperClass="comment-wrapper"
          color="#fff"
          backgroundColor="#f97316"
        />
      </div>
    </div>
  );
}
