import React, { useState, useEffect } from 'react';
import { Button, Spin, Result } from 'antd';
import {
	useAllCharactersQuery,
	CharacterDetailsFragment
} from '../graphql/__generated__/types';
import { isAvailable } from '../utils/helper';
import FilterControls from './FilterControls';
import CharacterTable from './CharacterTable';
import CharacterModal from './CharacterModal';

enum FilterKey { Gender, EyeColor, Species, Film, FavoritesOnly };

// Configuration for filtering characters
const filterConfig = [
	{ key: FilterKey.Gender, label: 'Gender', getValue: (character: CharacterDetailsFragment) => character.gender },
	{ key: FilterKey.EyeColor, label: 'Eye Color', getValue: (character: CharacterDetailsFragment) => character.eyeColor },
	{ key: FilterKey.Species, label: 'Species', getValue: (character: CharacterDetailsFragment) => character.species?.name },
	{
		key: FilterKey.Film, label: 'Film', getValue: (character: CharacterDetailsFragment) =>
			character.filmConnection?.films?.map(film => film?.title).filter(Boolean) as string[] ?? []
	},
	{ key: FilterKey.FavoritesOnly, label: 'Favorites Only', getValue: () => null }
];

// Component for displaying character overview
const CharacterOverview: React.FC<{ pageSize: number }> = ({ pageSize }) => {
	const { data, loading, error, fetchMore } = useAllCharactersQuery({ variables: { first: pageSize } });
	const totalCount = data?.allPeople?.totalCount ?? 0;



	// State for managing favorite characters
	const [favorites, setFavorites] = useState<CharacterDetailsFragment[]>(() => {
		const savedFavorites = localStorage.getItem('favorites');
		return savedFavorites ? JSON.parse(savedFavorites) : [];
	});

	// State for managing filter options
	const [filters, setFilters] = useState<Record<string, string[] | boolean>>(
		filterConfig.reduce((acc, filter) => {
			acc[filter.key] = filter.key === FilterKey.FavoritesOnly ? false : [];
			return acc;
		}, {} as Record<string, string[] | boolean>)
	);

	// State for managing selected character
	const [selectedCharacter, setSelectedCharacter] = useState<CharacterDetailsFragment | null>(null);



	// Effect to sync favorite characters with local storage
	useEffect(() => {
		localStorage.setItem('favorites', JSON.stringify(favorites));
	}, [favorites]);



	// Filter characters based on selected filters
	const allCharacters: CharacterDetailsFragment[] = filters[FilterKey.FavoritesOnly] ? favorites : (data?.allPeople?.edges ?? [])
		.filter(edge => edge && edge.node)
		.map(edge => edge!.node as CharacterDetailsFragment);

	const filteredCharacters: CharacterDetailsFragment[] = allCharacters.filter(character => {
		return filterConfig
			.filter(filter => filter.key !== FilterKey.FavoritesOnly)
			.every(filter => {
				const filterValues = filters[filter.key] as string[];
				const characterValues = filter.getValue(character);

				if (filter.key === FilterKey.Film) {
					return !filterValues.length || (characterValues && (characterValues as string[]).some(value => filterValues.includes(value)));
				} else {
					return !filterValues.length || (characterValues && filterValues.includes(characterValues as string));
				}
			});
	});



	// Generate filter options for FilterControls component
	const filterOptions = filterConfig.map(filter => {
		if (filter.key === FilterKey.FavoritesOnly) {
			return { label: filter.label, options: [] };
		} else {
			const uniqueValues = Array.from(new Set(allCharacters
				.flatMap(character => filter.getValue(character))
				.filter(isAvailable)
			)) as string[];
			return { label: filter.label, options: uniqueValues };
		}
	});



	// Toggle favorite status of a character
	const toggleFavorite = (character: CharacterDetailsFragment) => {
		const isFavorite = favorites.some(fav => fav.id === character.id);
		const updatedFavorites = isFavorite
			? favorites.filter(fav => fav.id !== character.id)
			: [...favorites, character];

		setFavorites(updatedFavorites);
	};

	// Handle filter change event
	const handleFilterChange = (filterKey: FilterKey, values: string[] | boolean) => {
		setFilters(prevFilters => ({
			...prevFilters,
			[filterKey]: values,
		}));
	};

	// Handle load more characters event
	const handleLoadMore = () => {
		fetchMore({
			variables: {
				first: pageSize,
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



	// Render loading state if data is still loading
	if (loading) return (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '75vh' }}>
			<Spin size='large' />
		</div>
	);
	if (error) return (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
			<Result
				status="500"
				title="Oh No"
				subTitle="Etwas ist schiefgelaufen..."
			/>
		</div >
	)

	// Render character overview
	return (
		<>
			<FilterControls
				filterOptions={filterOptions}
				filterValues={filters}
				onFilterChange={handleFilterChange}
			/>
			<CharacterTable
				characters={filteredCharacters ?? []}
				favorites={favorites}
				toggleFavorite={toggleFavorite}
				setSelectedCharacter={setSelectedCharacter}
			/>
			{
				!filters[FilterKey.FavoritesOnly] &&
				<div style={{ textAlign: 'center', margin: 20 }}>
					<Button type="primary" onClick={handleLoadMore} disabled={allCharacters.length >= totalCount}>Load More</Button>
				</div>
			}
			<CharacterModal
				selectedCharacter={selectedCharacter}
				setSelectedCharacter={setSelectedCharacter}
			/>
		</>
	);
};

export default CharacterOverview;
