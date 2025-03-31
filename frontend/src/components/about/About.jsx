import React from "react";
import {
  FaEnvelope,
  FaGithubAlt,
  FaLinkedinIn,
  FaCode,
  FaStar,
  FaLightbulb,
  FaUserAlt,
  FaBullhorn,
} from "react-icons/fa";

const About = () => {
  return (
    <div className="min-h-screen mx-auto p-8 bg-white shadow-xl rounded-lg my-10">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-3 text-gray-800">
          About EchoWrite
        </h1>
        <div className="w-20 h-1 bg-yellow-400 mx-auto mb-5"></div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Where ideas resonate and stories find their audience
        </p>
      </div>

      {/* Mission Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <FaBullhorn className="mr-2 text-yellow-500" /> Our Mission
        </h2>
        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          <span className="font-semibold">"EchoWrite"</span> represents the
          perfect blend of <span className="italic">Echo</span> (your unique
          voice resonating through the digital space) and{" "}
          <span className="italic">Write</span> (the craft of expressing
          yourself through words).
        </p>
        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          We've built this platform to empower writers, thinkers, and creators
          to share their perspectives, connect with like-minded individuals, and
          engage in meaningful conversations that matter.
        </p>
      </div>

      {/* Features Section */}
      <div className="mb-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaStar className="mr-2 text-yellow-500" /> Features
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="bg-yellow-100 p-2 rounded-full mr-3">
              <FaCode className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium">Rich Content Creation</h3>
              <p className="text-gray-600">
                Create and edit professionally formatted blog posts with ease
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-yellow-100 p-2 rounded-full mr-3">
              <FaUserAlt className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium">Community Engagement</h3>
              <p className="text-gray-600">
                Follow users, comment on posts, and engage with a vibrant
                community
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-yellow-100 p-2 rounded-full mr-3">
              <FaLightbulb className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium">Smart Discovery</h3>
              <p className="text-gray-600">
                Find relevant content with our advanced keyword search
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-yellow-100 p-2 rounded-full mr-3">
              <FaStar className="text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium">Coming Soon</h3>
              <p className="text-gray-600">
                Interactive polls and AI-powered content suggestions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <FaCode className="mr-2 text-yellow-500" /> Technology Stack
        </h2>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            "React",
            "Tailwind CSS",
            "Node.js",
            "PostgreSQL",
            "Firebase Auth",
            "Vercel",
          ].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Developer Section */}
      <div className="mb-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <FaUserAlt className="mr-2 text-yellow-500" /> About the Developers
        </h2>
        <div className="space-y-6">
          {/* Lavish Mathur */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Lavish Mathur</h3>
            <p className="text-gray-600 mb-3">Full-stack Developer</p>
            <p className="text-gray-700">
              I'm building EchoWrite as part of my B.Tech minor project,
              focusing on making content creation smoother and more interactive.
              I enjoy turning ideas into scalable web applications that people
              actually use. When I'm not coding, I'm usually experimenting with
              new tech or refining my existing projects.
            </p>
          </div>

          {/* Sahil Ansari */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Sahil Ansari</h3>
            <p className="text-gray-600 mb-3">Backend Developer</p>
            <p className="text-gray-700">
              Passionate about building robust and scalable backend systems. I
              specialize in creating efficient server-side architectures and
              ensuring seamless data management. My focus is on developing
              clean, maintainable code that powers innovative web applications.
            </p>
          </div>

          {/* Shivam Bisht */}
          <div>
            <h3 className="text-xl font-semibold">Shivam Bisht</h3>
            <p className="text-gray-600 mb-3">Frontend Developer</p>
            <p className="text-gray-700">
              Dedicated to crafting intuitive and responsive user interfaces.
              I'm passionate about creating engaging user experiences and
              bringing design concepts to life. My expertise lies in modern web
              technologies and creating pixel-perfect, user-friendly interfaces.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaEnvelope className="mr-2 text-yellow-500" /> Get in Touch
        </h2>
        <div className="space-y-4">
          {/* EchoWrite Email */}
          <div className="flex flex-col md:flex-row gap-6">
            <a
              href="mailto:blog.echowrite@gmail.com"
              className="flex items-center px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <FaEnvelope className="text-red-500 mr-3 text-xl" />
              <span>EchoWrite Official Email</span>
            </a>
          </div>

          {/* GitHub Repository */}
          <div className="flex flex-col md:flex-row gap-6">
            <a
              href="https://github.com/echowrite-project/echowrite"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaGithubAlt className="text-gray-700 mr-3 text-xl" />
              <span>EchoWrite GitHub Repository</span>
            </a>
          </div>

          {/* Developer LinkedIn Profiles */}
          <div className="flex flex-wrap gap-4">
            {/* Lavish Mathur */}
            <a
              href="https://linkedin.com/in/lavishmathur"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <FaLinkedinIn className="text-blue-600 mr-3 text-xl" />
              <span>Lavish Mathur</span>
            </a>

            {/* Sahil Ansari */}
            <a
              href="https://www.linkedin.com/in/sahil-ansari-2bb9aa25a/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <FaLinkedinIn className="text-blue-600 mr-3 text-xl" />
              <span>Sahil Ansari</span>
            </a>

            {/* Shivam Bisht */}
            <a
              href="https://www.linkedin.com/in/shivam-bisht-284184354"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <FaLinkedinIn className="text-blue-600 mr-3 text-xl" />
              <span>Shivam Bisht </span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} EchoWrite. All rights reserved.</p>
      </div>
    </div>
  );
};

export default About;
