import { createElement } from "react";
import { RouteObject, useRoutes } from "react-router-dom";
import Home from "../pages/Home";

const MainRouter: RouteObject = {
  path: "/",
  element: createElement(Home),
};

export default function ThemeRouter() {
  return useRoutes([MainRouter]);
}
