import { createBrowserRouter } from "react-router";

import Home from "./pages/Home";

const router = createBrowserRouter([
    { path: '/', index: true, Component: Home }
]);

export default router
