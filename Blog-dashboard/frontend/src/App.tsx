import React, { use, useEffect } from 'react'
import RootLayout from './Components/RootLayout'
import Login from './Components/Login'
import Signup from './Components/Signup'
import CreatePost from './Components/CreatePost'
import Posts from './Components/Posts'
import { store } from "../store/store"
import { Provider, useDispatch } from 'react-redux'
import { createBrowserRouter, RouteObject, RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import {queryClient} from '../http'
import PostDetailes from './Components/PostDetailes'
import Dashboard from './Components/Dashboard'
import { setToken } from '../store/authSlice'

const dispatch = useDispatch();

useEffect(() => {
  const token = localStorage.getItem("token");
  dispatch(setToken(token))
}, [])

const App: React.FC = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <Login />,
        },
        {
          path: "signup",
          element: <Signup />,
        },
        {
          path: "create-post",
          element: <CreatePost />,
        },
        {
          path: "posts",
          element: <Posts />,
        },
        {
          path: "posts/:postId",
          element: <PostDetailes />,
        },
        {
          path: "/dashboard",
          element: <Dashboard />
        }

      ]
    }
  ] as RouteObject[])
 
   

  return (
    <>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Provider>
    </>
  )
}

export default App
