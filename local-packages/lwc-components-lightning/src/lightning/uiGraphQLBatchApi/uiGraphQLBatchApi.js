// gql is tagged template literal that parses GraphQL query strings and returns an opaque reference to the user land
// that opaque reference is consumed by the luvio adapter
export { gql } from 'force/ldsGraphqlParser';
export {
    graphqlBatch as unstable_graphqlBatch,
    graphqlBatch_imperative as unstable_graphqlBatch_imperative,
} from 'force/ldsAdaptersUiapiGraphql';
