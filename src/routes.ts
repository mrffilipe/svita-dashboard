import { createBrowserRouter } from "react-router";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PlatformTenants from "./pages/PlatformTenants";
import MyTenants from "./pages/MyTenants";
import TenantMembers from "./pages/TenantMembers";
import Bases from "./pages/Bases";
import Vehicles from "./pages/Vehicles";
import UserProfile from "./pages/UserProfile";
import Drivers from "./pages/Drivers";
import Requests from "./pages/Requests";
import Occurrences from "./pages/Occurrences";

const router = createBrowserRouter([
    { path: '/', index: true, Component: Home },
    { path: '/login', Component: Login },
    { path: '/register', Component: Register },
    { path: '/forgot-password', Component: ForgotPassword },
    { path: '/platform-tenants', Component: PlatformTenants },
    { path: '/my-tenants', Component: MyTenants },
    { path: '/tenant-members', Component: TenantMembers },
    { path: '/bases', Component: Bases },
    { path: '/vehicles', Component: Vehicles },
    { path: '/profile', Component: UserProfile },
    { path: '/drivers', Component: Drivers },
    { path: '/requests', Component: Requests },
    { path: '/occurrences', Component: Occurrences }
]);

export default router
