import React from "react";
import { getUserPosts } from "../../http";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

/**
 * Represents a single blog post.
 */
type Post = {
  id: string;
  title: string;
  body: string;
  author: string;
  publishedAt: string;
  authorId: string;
};

/**
 * Array of blog posts.
 */
type Posts = Post[];

/**
 * Dashboard component displays the user's profile and their blog posts.
 * Redirects to home if not authenticated.
 * Fetches the user's posts from the API and displays them.
 * Allows navigation to post details and to create a new post.
 *
 * @component
 * @returns {JSX.Element} The rendered dashboard view.
 */
const Dashboard: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/"); 
    }
  }, []);

  /**
   * Fetches the user's posts using React Query.
   */
  const { data: posts, isPending, error } = useQuery<Posts>({
    queryKey: ["userPosts"],
    queryFn: () => getUserPosts(token),
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold text-blue-600">Dashboard</h2>
      

      {user ? (
        <div className="mt-4">
          <p className="text-gray-700">
            Username: <span className="font-semibold">{user.name}</span>
          </p>
          <p className="text-gray-700">
            Email:{" "}
            <span className="font-semibold">
              {user.email}
            </span>
          </p>
        </div>
      ) : (
        <p className="text-gray-500">No user information available.</p>
      )}

      <h3 className="text-xl font-semibold text-gray-800 mt-6">
        Your Blog Posts:
      </h3>
      
      {posts?.length > 0 && !error ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800">
                {post.title}
              </h3>
              <p className="text-gray-600 break-words">{post.body}</p>
              <button
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                onClick={() => navigate(`/posts/${post.id}`)}
              >
                View Post
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">
          No posts found.{" "}
          <button
            onClick={() => navigate("/create-post")}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Create one?
          </button>
        </p>
      )}
    </div>
  );
}

export default Dashboard;
