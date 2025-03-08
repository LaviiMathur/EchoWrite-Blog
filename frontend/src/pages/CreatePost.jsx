import React from "react";
import { Header, PostForm } from "../components/index.components";

function CreatePost() {

  return (
    <>
      <Header />
      <div className="min-h-full     md:w-5/6 mx-auto md:py-8   ">
        <div className="px-4  sm:px-6 bg-gray-100  shadow-lg rounded-lg">
          <h2 className="text-2xl py-5 font-bold text-center border-b text-gray-800">
            Create New Post
          </h2>
          <div className="p-6">
            <PostForm />
          </div>
        </div>
      </div>
    </>
  );
}

export default CreatePost;
