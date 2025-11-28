import Home from "@/app/page";
import { render } from "@testing-library/react";


describe("Home Page", () => {
  it("renders without crashing", () => {
    render(<Home />);
  });
});
