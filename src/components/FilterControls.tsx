import React from 'react';
import { Select, Checkbox } from 'antd';

const { Option } = Select;

interface Filter {
	key: number;
	label: string;
	options: string[];
	values: string[];
}

interface FilterToggle {
	key: number;
	label: string;
	value: boolean;
}

interface FilterControlsProps {
	filters: Filter[];
	onFilterChange: (filterKey: number, values: string[]) => void;
	filterToggles: FilterToggle[],
	onToggleChange: (filterToggleKey: number, value: boolean) => void;
}


const FilterControls: React.FC<FilterControlsProps> = ({
	filters,
	onFilterChange,
	filterToggles,
	onToggleChange
}) => {
	return (
		<div style={{ marginBottom: 16 }}>
			{filters.map((filter, index) => (
				<label key={filter.key} style={{ marginLeft: index > 0 ? 16 : 0 }}>
					{filter.label}:
					<Select
						mode="multiple"
						style={{ width: 200, marginLeft: 8 }}
						placeholder={`Select ${filter.label}`}
						onChange={(values: string[]) => onFilterChange(filter.key, values)}
						value={filter.values}
					>
						{filter.options.map(option => (
							<Option key={option} value={option}>{option}</Option>
						))}
					</Select>
				</label>
			))}
			{filterToggles.map((filterToggle) => (
				<label key={filterToggle.key} style={{ marginLeft: 16 }}>
					{filterToggle.label}:
					<Checkbox
						checked={filterToggle.value}
						onChange={(e) => onToggleChange(filterToggle.key, e.target.checked)}
						style={{ marginLeft: 8 }}
					/>
				</label>
			))}
		</div>
	);
};

export default FilterControls;
