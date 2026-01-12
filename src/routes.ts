import { createBrowserRouter } from "react-router";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PlatformTenants from "./pages/PlatformTenants";
import MyTenants from "./pages/MyTenants";
import TenantMembers from "./pages/TenantMembers";

const router = createBrowserRouter([
    { path: '/', index: true, Component: Home },
    { path: '/login', Component: Login },
    { path: '/register', Component: Register },
    { path: '/forgot-password', Component: ForgotPassword },
    { path: '/platform-tenants', Component: PlatformTenants },
    { path: '/my-tenants', Component: MyTenants },
    { path: '/tenant-members', Component: TenantMembers }
]);

export default router
