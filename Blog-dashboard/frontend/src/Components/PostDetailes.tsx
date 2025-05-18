import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getPostById, deletePost } from "../../http";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { queryClient } from "../../http";

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
 * PostDetails component displays the details of a single blog post.
 * Redirects to home if not authenticated.
 * Allows the author to delete the post.
 *
 * @component
 * @returns {JSX.Element} The rendered post details view.
 */
const PostDetails: React.FC = () => {
  const { postId } = useParams<string>();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/"); 
    }
  }, []);

  /**
   * Fetches the post data by ID using React Query.
   */
  const {
    data: post,
    isPending,
    error,
  } = useQuery<Post>({
    queryKey: ["post", postId],
    queryFn: () => getPostById({postId, token}),
  });

  /**
   * Handles post deletion using React Query mutation.
   * On success, invalidates the posts query and navigates to the posts list.
   */
  const {
    mutate,
    isPending: deleting,
    error: errorDeleting,
  } = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
        refetchType: "none"
      });
      navigate("/posts");
    },
  });

  /**
   * Handles the delete button click event.
   * Prompts the user for confirmation before deleting the post.
   */
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      mutate({postId, token});
    }
  }

  if (isPending)
    return <p className="text-center text-gray-500">Loading post...</p>;
  if (error)
    return (
      <p className="text-center text-red-500">
        Error fetching post. Please try again.
      </p>
    );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold text-blue-600">
        {post?.title ?? "Untitled Post"}
      </h2>
      <p className="mt-2 text-gray-700 break-words">
        {post?.body ?? "No content available."}
      </p>
      <p className="mt-4 text-gray-500">
        <span className="font-semibold">Author:</span>{" "}
        {post?.author ?? "Unknown"}
      </p>
      <p className="mt-1 text-gray-500">
        <span className="font-semibold">Published At:</span>{" "}
        {post?.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString()
          : "Date not available"}
      </p>
      {user?.id === post?.authorId && token && (
        <div className="mt-4 flex gap-4">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
            onClick={handleDelete}
          >
            Delete Post
          </button>
        </div>
      )}
    </div>
  );
}

export default PostDetails;
