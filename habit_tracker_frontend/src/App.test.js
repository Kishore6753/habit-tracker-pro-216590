import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders sign in screen when not authenticated", () => {
  render(<App />);
  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
});
