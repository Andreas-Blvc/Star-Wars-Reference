import React from 'react';
import { Table, Button } from 'antd';
import { CharacterDetailsFragment } from '../graphql/__generated__/types';
import { isAvailable } from '../utils/helper';

interface CharacterTableProps {
	characters: CharacterDetailsFragment[];
	favorites: CharacterDetailsFragment[];
	toggleFavorite: (id: CharacterDetailsFragment) => void;
	setSelectedCharacter: (character: CharacterDetailsFragment | null) => void;
}

const CharacterTable: React.FC<CharacterTableProps> = ({
	characters,
	favorites,
	toggleFavorite,
	setSelectedCharacter,
}) => {
	const displayValue = (value: any) => {
		return isAvailable(value) ? value : '-';
	};

	const columns = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			render: displayValue,
		},
		{
			title: 'Height',
			dataIndex: 'height',
			key: 'height',
			render: displayValue,
		},
		{
			title: 'Mass',
			dataIndex: 'mass',
			key: 'mass',
			render: displayValue,
		},
		{
			title: 'Homeworld',
			dataIndex: ['homeworld', 'name'],
			key: 'homeworld',
			render: displayValue,
		},
		{
			title: 'Species',
			dataIndex: ['species', 'name'],
			key: 'species',
			render: displayValue,
		},
		{
			title: 'Gender',
			dataIndex: 'gender',
			key: 'gender',
			render: displayValue,
		},
		{
			title: 'Eye Color',
			dataIndex: 'eyeColor',
			key: 'eyeColor',
			render: displayValue,
		},
		{
			title: 'Favorite',
			key: 'favorite',
			render: (text: any, record: CharacterDetailsFragment) => (
				<Button
					type={favorites.some(favorite => favorite.id === record.id) ? 'primary' : 'default'}
					onClick={() => toggleFavorite(record)}
				>
					{favorites.some(favorite => favorite.id === record.id) ? 'Unfavorite' : 'Favorite'}
				</Button>
			),
		},
		{
			title: 'Details',
			key: 'details',
			render: (text: any, record: CharacterDetailsFragment) => (
				<Button onClick={() => setSelectedCharacter(record)}>
					View Details
				</Button>
			),
		},
	];

	return (
		<Table
			dataSource={characters}
			columns={columns}
			rowKey="id"
			pagination={false}
		/>
	);
};

export default CharacterTable;
