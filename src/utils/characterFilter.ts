import { CharacterDetailsFragment } from '../graphql/__generated__/types';
import { isAvailable } from './helper';

export enum FilterKey { Gender, EyeColor, Species, Film };

// Configuration for filtering characters
const filterConfig = [
	{ 
		key: FilterKey.Gender, 
		getValue: (character: CharacterDetailsFragment) => character.gender 
	},
	{ 
		key: FilterKey.EyeColor,
		getValue: (character: CharacterDetailsFragment) => character.eyeColor 
	},
	{ 
		key: FilterKey.Species, 
		getValue: (character: CharacterDetailsFragment) => character.species?.name },
	{
		key: FilterKey.Film, 
		getValue: (character: CharacterDetailsFragment) =>
			character.filmConnection?.films?.map(film => film?.title).filter(Boolean) as string[] ?? []
	}
];

export const createFilterValues = (): Record<FilterKey, string[]> => {
	return filterConfig.reduce((acc, filter) => {
		acc[filter.key] = [];
		return acc;
	}, {} as Record<FilterKey, string[]>)
}


export const getUniqueFilterOptions = (filterKey: FilterKey, characters: CharacterDetailsFragment[]) => {
    const filterConfigItem = filterConfig.find(config => config.key === filterKey);
    if (!filterConfigItem) {
        throw new Error(`Invalid filter key: ${filterKey}`);
    }
    
    const uniqueValues = Array.from(new Set(characters
        .flatMap(character => filterConfigItem.getValue(character))
        .filter(isAvailable)
    ));
    return uniqueValues;
}



export const applyFilter = (filters: Record<FilterKey, string[]>, characters: CharacterDetailsFragment[]) => {
	return characters
	.filter(character =>
		filterConfig.every(filter => {
			const filterValues = filters[filter.key] as string[];
			const characterValues = filter.getValue(character);

			if (filter.key === FilterKey.Film) {
				return !filterValues.length || (characterValues && (characterValues as string[]).some(value => filterValues.includes(value)));
			} else {
				return !filterValues.length || (characterValues && filterValues.includes(characterValues as string));
			}
		})
	);
}