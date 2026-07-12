import { useEffect } from "react";
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import SiteCat from "./components/SiteCat";
import Portfolio from "./Portfolio";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";

// the SPA keeps the window scroll across route changes; start each page at the top
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// shared shell so ScrollToTop runs inside the router on every route;
// the cat roams the home page and blog list but stays out of posts —
// it would distract from reading
function Root() {
  const { pathname } = useLocation();
  return (
    <>
      <ScrollToTop />
      <Outlet />
      {(pathname === "/" || pathname === "/blog") && <SiteCat />}
    </>
  );
}

// a data router (createBrowserRouter) instead of <BrowserRouter>: the
// `viewTransition` opt-in on links only takes effect when navigation runs
// through the data router
const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      { path: "/", element: <Portfolio /> },
      { path: "/blog", element: <BlogList /> },
      { path: "/blog/:slug", element: <BlogPost /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
