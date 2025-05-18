import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "../../http";
import { Link, useNavigate } from "react-router-dom";
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
};

/**
 * Array of blog posts.
 */
type Posts = Post[];

/**
 * Posts component displays a list of all blog posts.
 * Redirects to home if not authenticated.
 * Fetches posts from the API and displays them sorted by published date.
 *
 * @component
 * @returns {JSX.Element} The rendered posts list.
 */
const Posts: React.FC = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  const { data: posts, isPending, error } = useQuery<Posts>({
    queryKey: ["posts"],
    queryFn: () => getPosts(token),
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">All Posts</h1>
      {isPending && <p className="text-center">Loading...</p>}
      {error && (
        <p className="text-red-500 text-center">
          {error.message}
        </p>
      )}
      <ul className="space-y-2 ">
        {posts
          ?.slice()
          .sort(
            (a, b) =>
              new Date(b.publishedAt).getTime() -
              new Date(a.publishedAt).getTime()
          )
          .map((post) => (
            <li
              key={post.id}
              className="p-3 border rounded flex justify-between my-2 hover:bg-gray-200 w-4/5 mx-auto border-blue-300 hover:border-blue-500 transition duration-300 ease-in-out cursor-pointer shadow-md"
            >
              <Link to={`${post.id}`} className="no-underline text-black w-full block">
                <div className="flex flex-col w-full">
                  <h3 className="font-bold overflow-hidden">{post.title}</h3>
                  <p className=" break-words">{post.body}</p>
                  <p className="text-sm text-gray-500">By {post.author}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Posts;