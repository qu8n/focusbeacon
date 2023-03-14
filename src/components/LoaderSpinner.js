import { Comment } from "react-loader-spinner";
import React from "react";

export default function LoaderSpinner() {
  return (
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
  );
}
