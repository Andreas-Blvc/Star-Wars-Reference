import { graphql } from '../generated';

export const AllCharactersQuery = graphql(/* GraphQL */ `
query AllCharacters($first: Int!, $after: String) {
  allPeople(first: $first, after: $after) {
    edges {
      node {
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
    }
    pageInfo {
      endCursor
      hasNextPage
    }
    totalCount
  }
}
`);

// export const GetCharacterDetailsQuery = graphql(/* GraphQL */ `
//   query GetCharacterDetails($id: ID!) {
//     person(id: $id) {
//       id
//       name
//       height
//       mass
//       gender
//       eyeColor
//       homeworld {
//         name
//       }
//       species {
//         name
//       }
//       filmConnection {
//         films {
//           title
//         }
//       }
//     }
//   }
// `);
