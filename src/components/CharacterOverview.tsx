import React, { useState, useEffect } from 'react';
import { Button, Spin, Result } from 'antd';
import {
	useAllCharactersQuery,
	CharacterDetailsFragment
} from '../graphql/__generated__/types';
import { applyFilter, createFilterValues, getUniqueFilterOptions, FilterKey } from '../utils/characterFilter';
import FilterControls from './FilterControls';
import CharacterTable from './CharacterTable';
import CharacterModal from './CharacterModal';


// Component for displaying character overview
const CharacterOverview: React.FC<{ pageSize: number }> = ({ pageSize }) => {
	const { data, loading, error, fetchMore } = useAllCharactersQuery({ variables: { first: pageSize } });
	const totalCount = data?.allPeople?.totalCount ?? 0;


	// State for managing favorite characters
	const [favorites, setFavorites] = useState<CharacterDetailsFragment[]>(() => {
		const savedFavorites = localStorage.getItem('favorites');
		return savedFavorites ? JSON.parse(savedFavorites) : [];
	});

	// State for managing filter mode:
	const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false)

	// State for managing filter options
	const [filterValues, setFilterValues] = useState<Record<FilterKey, string[]>>(createFilterValues());

	// State for managing selected character
	const [selectedCharacter, setSelectedCharacter] = useState<CharacterDetailsFragment | null>(null);


	// Effect to sync favorite characters with local storage
	useEffect(() => {
		localStorage.setItem('favorites', JSON.stringify(favorites));
	}, [favorites]);



	// Filter characters based on selected filters
	const allCharacters: CharacterDetailsFragment[] = favoritesOnly ? favorites : (data?.allPeople?.edges ?? [])
		.filter(edge => edge && edge.node)
		.map(edge => edge!.node as CharacterDetailsFragment);


	const filteredCharacters: CharacterDetailsFragment[] = applyFilter(filterValues, allCharacters);

	// Toggle favorite status of a character
	const toggleFavorite = (character: CharacterDetailsFragment) => {
		const isFavorite = favorites.some(fav => fav.id === character.id);
		const updatedFavorites = isFavorite
			? favorites.filter(fav => fav.id !== character.id)
			: [...favorites, character];
		setFavorites(updatedFavorites);
	};

	// Handle filter change event
	const handleFilterChange = (filterKey: FilterKey, values: string[]) => {
		setFilterValues(prevFilters => ({
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

	const getLabel = (filterKey: FilterKey): string => {
		switch (filterKey) {
			case FilterKey.EyeColor: return 'Eye Color';
			case FilterKey.Film: return 'Film';
			case FilterKey.Gender: return 'Gender';
			case FilterKey.Species: return 'Species';
		}
	}

	const getFilterControls = () => {
		return Object.keys(FilterKey).reduce((acc, e: string) => {
			const filterKey = Number(e);
			if (!Number.isNaN(filterKey)) {
				acc.push({
					key: filterKey,
					label: getLabel(filterKey),
					options: getUniqueFilterOptions(filterKey, allCharacters) as string[],
					values: filterValues[filterKey as FilterKey],
				});
			}
			return acc;
		}, [] as { key: number; label: string; options: string[]; values: string[] }[])
	}

	// Render character overview
	return (
		<>
			<FilterControls
				filters={getFilterControls()}
				onFilterChange={handleFilterChange}
				filterToggles={
					[
						{
							key: 42,
							label: 'Favorites Only',
							value: favoritesOnly,
						}
					]
				}
				onToggleChange={(key, value) => {
					if (key === 42) {
						setFavoritesOnly(value);
					}
				}}
			/>
			<CharacterTable
				characters={filteredCharacters ?? []}
				favorites={favorites}
				toggleFavorite={toggleFavorite}
				setSelectedCharacter={setSelectedCharacter}
			/>
			{
				!favoritesOnly &&
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
