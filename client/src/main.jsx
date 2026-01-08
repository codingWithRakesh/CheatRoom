import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom"
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Message from './pages/Message.jsx'
import Error from './pages/Error.jsx'
import Loading from './components/Loading.jsx'
import RightSidebarContextProvider from './contexts/rightSIdebarContext.jsx'
import FeedbackContextProvider from './contexts/feedbackContent.jsx'
import TimeContextProvider from './contexts/timeContext.jsx'

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
      },
      {
        path: "/g",
        element: <Loading />
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TimeContextProvider>
      <FeedbackContextProvider>
        <RightSidebarContextProvider>
          <RouterProvider router={router} />
        </RightSidebarContextProvider>
      </FeedbackContextProvider>
    </TimeContextProvider>
  </StrictMode>
)
