import React from 'react';
import { Select, Checkbox } from 'antd';

const { Option } = Select;

interface FilterOption {
	label: string;
	options: string[];
}

interface FilterControlsProps {
	filterOptions: FilterOption[];
	filterValues: Record<string, string[] | boolean>;
	onFilterChange: (filterKey: number, values: string[] | boolean) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
	filterOptions,
	filterValues,
	onFilterChange,
}) => {
	const handleFilterChange = (filterKey: number, values: string[] | boolean) => {
		onFilterChange(filterKey, values);
	};
	console.log(filterValues);
	console.log(filterOptions);

	return (
		<div style={{ marginBottom: 16 }}>
			{filterOptions.map((filterOption, index) => (
				<label key={index} style={{ marginLeft: index > 0 ? 16 : 0 }}>
					{filterOption.label}:
					{typeof filterValues[index] === 'boolean' ? (
						<Checkbox
							checked={filterValues[index] as boolean}
							onChange={(e) => handleFilterChange(index, e.target.checked)}
							style={{ marginLeft: 8 }}
						/>
					) : (
						<Select
							mode="multiple"
							style={{ width: 200, marginLeft: 8 }}
							placeholder={`Select ${filterOption.label}`}
							onChange={(values: string[]) => handleFilterChange(index, values)}
							value={filterValues[index] as string[]}
						>
							{filterOption.options.map(option => (
								<Option key={option} value={option}>{option}</Option>
							))}
						</Select>
					)}
				</label>
			))}
		</div>
	);
};

export default FilterControls;
