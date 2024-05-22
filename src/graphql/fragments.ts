import { graphql } from '../generated';

export const CharacterDetailsFragment = graphql(/* GraphQL */ `
  fragment CharacterDetails on Person {
    id
    name
    height
    mass
    gender
    eyeColor
    homeworld {
      name
    }
    species {
      name
    }
    filmConnection {
      films {
        title
      }
    }
  }
`);
