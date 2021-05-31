const BottomBackButton = ({ onClick, children }) => (
	<button
		className="rounded-lg min-w-32 font-medium p-3 bg-gray-200"
		onClick={onClick}
	>
		{children}
	</button>
);

const BottomNextButton = ({ onClick, children, disabled = false }) => (
	<button
		className="rounded-lg min-w-32 font-medium p-3 bg-teal-500 text-white"
		onClick={onClick}
		disabled={disabled}
	>
		{children}
	</button>
);

export { BottomNextButton, BottomBackButton };
