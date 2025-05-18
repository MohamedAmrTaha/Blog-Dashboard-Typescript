import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { createPost } from "../../http";
import { useNavigate } from "react-router-dom";
import { queryClient } from "../../http";

/**
 * Props for creating a new post.
 */
type PostProps = {
    postData: {
        title: string;
        body: string;
    };
    token: string;
};

/**
 * CreatePost component renders a form for creating a new blog post.
 * Handles user input, validation, and submission to the createPost API.
 * Redirects to home if not authenticated.
 * On successful creation, invalidates the posts query and navigates to the posts list.
 *
 * @component
 * @returns {JSX.Element} The rendered create post form.
 */
const CreatePost:React.FC = () => {
    const [title, setTitle] = useState<string>("");
    const [body, setBody] = useState<string>("");
    const token = localStorage.getItem("token"); 
    const navigate = useNavigate(); 

    useEffect(()=>{
        if (!token) {
            navigate("/"); 
        }
    },[token, navigate]);

    /**
     * Handles the create post mutation and navigation on success.
     */
    const { mutate, isPending, error } = useMutation<any,Error,PostProps>({
      mutationFn: async ({postData, token})=> await createPost({postData, token}),
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        navigate("/posts"); // Redirect to posts page after successful post creation
      },
    });

    /**
     * Handles form submission, performs validation, and triggers create post mutation.
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = (e:React.FormEvent) => {
        e.preventDefault();
        if (!title || !body) {
            alert("Please fill in all fields.");
            return;
        }
        const postData = { title, body };
        mutate( {postData, token} );
    };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Create Post</h1>
      <form onSubmit={handleSubmit} className="space-y-3 w-1/2 mx-auto">
        <input
          type="text"
          placeholder="Title"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e:React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Body"
          className="w-full p-2 border rounded"
          value={body}
          onChange={(e:React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-600 w-full"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save Post"}
        </button>
      </form>
    </div>
  );
}
export default CreatePost;