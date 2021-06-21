/**
 * @jest-environment jsdom
 */
import HomePage from "../pages/index";
import { render, act } from "@testing-library/react";

// `describe` is not required, but it helps the tests read nicely
describe("The Home Page Component", () => {
	// Each test for the component will get an `it` block
	it("should render without warnings.", async () => {
		await act(async () => {
			render(<HomePage />);
		});
	});
});
