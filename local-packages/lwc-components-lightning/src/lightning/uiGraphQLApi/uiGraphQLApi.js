// gql is tagged template literal that parses GraphQL query strings and returns an opaque reference to the user land
// that opaque reference is consumed by the luvio adapter
export { gql } from 'force/ldsGraphqlParser';
export {
    graphql,
    graphql as unstable_graphql,
    graphql_imperative as unstable_graphql_imperative,
    refreshGraphQL,
} from 'force/ldsAdaptersUiapiGraphql';
