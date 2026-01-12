import { createBrowserRouter } from "react-router";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

const router = createBrowserRouter([
    { path: '/', index: true, Component: Home },
    { path: '/login', Component: Login },
    { path: '/register', Component: Register },
    { path: '/forgot-password', Component: ForgotPassword }
]);

export default router
