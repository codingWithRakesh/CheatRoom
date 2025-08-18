import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom"
import App from './App.jsx'
import Home from './pages/home.jsx'
import Message from './pages/message.jsx'
import Error from './pages/Error.jsx'

const router = createBrowserRouter([
  {
    path : "/",
    errorElement : <Error />,
    element : <App />,
    children : [
      {
        path: "/",
        element : <Home />
      },
      {
        path : "/:code",
        element : <Message />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
