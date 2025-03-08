import { Routes, Route } from "react-router-dom";
import {
  about,
  logIn,
  signUp,
  verify,
  createPost,
  index,
  singlePost,
  editPost,
  userProfile,
  updateProfile,
  savedPosts,
  userPosts,
} from "./Routes/Routes";

import { Login, Signup, Verify } from "./components/index.components";
import {
  About,
  SinglePost,
  CreatePost,
  EditPost,
  Home,
  UpdateProfile,
  UserProfile,
  Saved,
  UserPosts,
} from "./pages/index.pages";

function App() {
  return (
    <div className="bg-[#cdcdef] text-[#212529] w-full min-h-screen font-[poppins]">
      <Routes>
        <Route path={index} element={<Home />} />
        <Route path={logIn} element={<Login />} />
        <Route path={verify} element={<Verify />} />
        <Route path={signUp} element={<Signup />} />
        <Route path={about} element={<About />} />
        <Route path={createPost} element={<CreatePost />} />
        <Route path={editPost} element={<EditPost />} />
        <Route path={singlePost} element={<SinglePost />} />
        <Route path={userPosts} element={<UserPosts />} />
        <Route path={userProfile} element={<UserProfile />} />
        <Route path={updateProfile} element={<UpdateProfile />} />
        <Route path={savedPosts} element={<Saved />} />
      </Routes>
    </div>
  );
}

export default App;
