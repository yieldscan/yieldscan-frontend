import { ArrowLeft, ArrowRight } from "react-feather";

const BottomBackButton = ({ onClick, children, disabled = false }) => (
	<button
		className="rounded-lg min-w-32 font-medium p-3 bg-gray-200 z-20"
		onClick={onClick}
	>
		{children}
	</button>
);

const BottomNextButton = ({ onClick, children, disabled = false }) => (
	<button
		className={`rounded-lg min-w-32 font-medium p-3 bg-teal-500 text-white z-20 ${
			disabled && "cursor-not-allowed opacity-50"
		} transform hover:bg-teal-700`}
		onClick={onClick}
		disabled={disabled}
	>
		{children}
	</button>
);

const NextButton = ({ onClick, children, disabled = false }) => (
	<button
		className={`w-full rounded-lg min-w-32 font-medium p-3 bg-teal-500 text-white z-20 ${
			disabled && "cursor-not-allowed opacity-50"
		} transform hover:bg-teal-700`}
		onClick={onClick}
		disabled={disabled}
	>
		{children}
	</button>
);

const NextButtonContent = ({ name }) => (
	<div className="flex flex-row items-center justify-center space-x-2">
		<p>{name ? name : "Next"}</p>
		<ArrowRight size={16} />
	</div>
);

const BackButtonContent = ({ name }) => (
	<div className="flex flex-row items-center justify-center space-x-2">
		<ArrowLeft size={16} />
		<p>{name ? name : "Back"}</p>
	</div>
);

export {
	BottomNextButton,
	BottomBackButton,
	NextButtonContent,
	NextButton,
	BackButtonContent,
};
