import * as Types from '../../../../__generated__/graphql';

import { gql } from '@apollo/client';
export type RepositoryFragment = { __typename: 'Repository', id: string, name: string, description?: string | null, url: any, updatedAt: any };

export const RepositoryFragmentDoc = gql`
    fragment Repository on Repository {
  __typename
  id
  name
  description
  url
  updatedAt
}
    `;