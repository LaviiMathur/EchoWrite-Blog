import React from "react";
import { About, Header } from "../components/index.components";

const AboutPage = () => {
  return (
    <>
      <Header />

      <div className="container mx-auto p-6">
        <About />
      </div>
    </>
  );
};

export default AboutPage;
