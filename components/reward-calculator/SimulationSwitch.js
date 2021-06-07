import { Switch } from "@chakra-ui/core";

const SimulationSwitch = ({ simulationChecked, setSimulationChecked }) => {
	return (
		<div className="w-max flex items-center justify-end rounded-lg bg-gray-200 p-3">
			<Switch
				mb={-1}
				color="teal"
				isChecked={simulationChecked}
				onChange={(e) => {
					setSimulationChecked(e.target.checked);
				}}
			/>
			<span className="text-sm font-semibold ml-2 text-gray-600">
				Simulation
			</span>
		</div>
	);
};

export default SimulationSwitch;
