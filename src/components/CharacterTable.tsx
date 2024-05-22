import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Table, Button, Select, Checkbox, Modal, Pagination } from 'antd';
import CharacterDetails from './CharacterDetails';
import { AllCharactersQuery } from '../graphql/queries';


const { Option } = Select;
const pageSize = 16;

const CharacterTable: React.FC = () => {
	const { data, loading, fetchMore } = useQuery(AllCharactersQuery, { variables: { first: pageSize } });

	const [favorites, setFavorites] = useState<string[]>(() => {
		const savedFavorites = localStorage.getItem('favorites');
		return savedFavorites ? JSON.parse(savedFavorites) : [];
	});
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [genderFilter, setGenderFilter] = useState<string[]>([]);
	const [eyeColorFilter, setEyeColorFilter] = useState<string[]>([]);
	const [speciesFilter, setSpeciesFilter] = useState<string[]>([]);
	const [filmFilter, setFilmFilter] = useState<string[]>([]);
	const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
	const [selectedCharacter, setSelectedCharacter] = useState<any>(null);

	const toggleFavorite = (id: string) => {
		const updatedFavorites = favorites.includes(id)
			? favorites.filter(fav => fav !== id)
			: [...favorites, id];

		setFavorites(updatedFavorites);
		localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
	};



	const displayValue = (value: any) => {
		return value === null || value === undefined || value === 'n/a' ? '-' : value;
	};

	if (loading) return <p>Loading...</p>;

	// Filter Items
	const allCharacters = data?.allPeople?.edges ?? [];
	const currentPageCharacters = allCharacters
		.map((edge) => edge?.node)
		.slice((currentPage - 1) * pageSize, currentPage * pageSize);
	const filteredCharacters = currentPageCharacters
		.filter(character => {
			const genderMatch = genderFilter.length
				? character?.gender && genderFilter.includes(character.gender)
				: true;
			const eyeColorMatch = eyeColorFilter.length
				? character?.eyeColor && eyeColorFilter.includes(character.eyeColor)
				: true;
			const speciesMatch = speciesFilter.length
				? character?.species?.name && speciesFilter.includes(character.species.name)
				: true;
			const filmMatch = filmFilter.length
				? character?.filmConnection?.films?.some(
					film => film?.title && filmFilter.includes(film.title)
				)
				: true;
			const favoriteMatch = favoritesOnly
				? character?.id && favorites.includes(character.id)
				: true;

			return genderMatch && eyeColorMatch && speciesMatch && filmMatch && favoriteMatch;
		});

	// Prepare filters for current page:
	const uniqueGenders = Array.from(new Set(currentPageCharacters.map(character => displayValue(character?.gender)).filter(e => e !== '-')));
	const uniqueEyeColors = Array.from(new Set(currentPageCharacters.map(character => displayValue(character?.eyeColor)).filter(e => e !== '-')));
	const uniqueSpecies = Array.from(new Set(currentPageCharacters.map(character => displayValue(character?.species?.name)).filter(e => e !== '-')));
	const uniqueFilms: string[] = [];
	currentPageCharacters.forEach(character => {
		if (character?.filmConnection?.films) {
			character.filmConnection.films.forEach((film) => {
				if (film?.title && !uniqueFilms.includes(film?.title)) {
					uniqueFilms.push(film?.title);
				}
			});
		}
	});

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
			render: (text: any, record: any) => (
				<Button
					type={favorites.includes(record.id) ? 'primary' : 'default'}
					onClick={() => toggleFavorite(record.id)}
				>
					{favorites.includes(record.id) ? 'Unfavorite' : 'Favorite'}
				</Button>
			),
		},
		{
			title: 'Details',
			key: 'details',
			render: (text: any, record: any) => (
				<Button onClick={() => setSelectedCharacter(record)}>
					View Details
				</Button>
			),
		},
	];

	const handlePaginationChange = (page: number) => {
		setCurrentPage(page);
		const amountToLoad = page * pageSize - allCharacters.length
		if (amountToLoad <= 0) return;
		fetchMore({
			variables: {
				first: amountToLoad,
				after: data?.allPeople?.pageInfo.endCursor,
			},
			updateQuery: (previousResult, { fetchMoreResult }) => {
				if (!fetchMoreResult) return previousResult;
				if (!previousResult.allPeople
					|| !previousResult.allPeople.edges
					|| !fetchMoreResult.allPeople
					|| !fetchMoreResult.allPeople.edges
				) return previousResult;
				return {
					allPeople: {
						...fetchMoreResult.allPeople,
						edges: [
							...previousResult.allPeople.edges,
							...fetchMoreResult.allPeople.edges,
						],
						pageInfo: fetchMoreResult.allPeople.pageInfo
					},
				};
			},
		});
	};

	return (
		<div>
			<div style={{ marginBottom: 16 }}>
				<label>
					Gender:
					<Select
						mode="multiple"
						style={{ width: 200, marginLeft: 8 }}
						placeholder="Select gender"
						onChange={(values: string[]) => setGenderFilter(values)}
					>
						{uniqueGenders.map(option => (
							<Option key={option} value={option}>{option}</Option>
						))}
					</Select>
				</label>
				<label style={{ marginLeft: 16 }}>
					Eye Color:
					<Select
						mode="multiple"
						style={{ width: 200, marginLeft: 8 }}
						placeholder="Select eye color"
						onChange={(values: string[]) => setEyeColorFilter(values)}
					>
						{uniqueEyeColors.map(option => (
							<Option key={option} value={option}>{option}</Option>
						))}
					</Select>
				</label>
				<label style={{ marginLeft: 16 }}>
					Species:
					<Select
						mode="multiple"
						style={{ width: 200, marginLeft: 8 }}
						placeholder="Select species"
						onChange={(values: string[]) => setSpeciesFilter(values)}
					>
						{uniqueSpecies.map(option => (
							<Option key={option} value={option}>{option}</Option>
						))}
					</Select>
				</label>
				<label style={{ marginLeft: 16 }}>
					Film:
					<Select
						mode="multiple"
						style={{ width: 200, marginLeft: 8 }}
						placeholder="Select film"
						onChange={(values: string[]) => setFilmFilter(values)}
					>
						{uniqueFilms.map(option => (
							<Option key={option} value={option}>{option}</Option>
						))}
					</Select>
				</label>
				<label style={{ marginLeft: 16 }}>
					Favorites Only:
					<Checkbox
						checked={favoritesOnly}
						onChange={(e) => setFavoritesOnly(e.target.checked)}
						style={{ marginLeft: 8 }}
					/>
				</label>
			</div>
			<Table
				dataSource={filteredCharacters}
				columns={columns}
				rowKey="id"
				pagination={false}
			/>
			<Pagination
				current={currentPage} // Current page number
				pageSize={pageSize} // Number of items per page
				total={data?.allPeople?.totalCount || 0} // Total number of items
				onChange={handlePaginationChange} // Function to handle page changes
				style={{ margin: 32, textAlign: 'center' }}
				showSizeChanger={false}
			/>
			{selectedCharacter && (
				<Modal
					open={true}
					onCancel={() => setSelectedCharacter(null)}
					footer={null}
				>
					<CharacterDetails characterDetails={selectedCharacter} />
				</Modal>
			)
			}
			{/* {data?.allPeople?.pageInfo.hasNextPage && (
				<Button
					onClick={() => fetchMore({
						variables: {
							after: data?.allPeople?.pageInfo.endCursor,
						},
						updateQuery: (previousResult, { fetchMoreResult }) => {
							if (!fetchMoreResult) return previousResult;
							if (!previousResult.allPeople
								|| !previousResult.allPeople.edges
								|| !fetchMoreResult.allPeople
								|| !fetchMoreResult.allPeople.edges
							) return previousResult;
							return {
								allPeople: {
									...fetchMoreResult.allPeople,
									edges: [
										...previousResult.allPeople.edges,
										...fetchMoreResult.allPeople.edges,
									],
									pageInfo: fetchMoreResult.allPeople.pageInfo
								},
							};
						},
					})}
					style={{ marginTop: 16 }}
				>
					Load More
				</Button>
			)} */}
		</div >
	);
};

export default CharacterTable;
