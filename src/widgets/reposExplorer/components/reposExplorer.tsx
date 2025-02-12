'use client';

import { useEffect, useState, useRef } from 'react';
import { useRepositoriesByOwnerQuery } from '@/entities/repositories/gql/queries/repositoriesByOwner.graphql';
import { RepoCard } from '@/entities/repositories';
import { Spinner } from '@/shared/components/ui/Spinner';
import { Input } from '@/shared/components/ui/Input';

export const ReposExplorer = () => {
  const [login, setLogin] = useState('');
  const isFetching = useRef(false);

  const { data, loading, fetchMore } = useRepositoriesByOwnerQuery({
    variables: {
      login,
      after: undefined,
    },
    skip: !login,
  });

  const repos = data?.repositoryOwner?.repositories.nodes || [];
  const hasNextPage = data?.repositoryOwner?.repositories.pageInfo.hasNextPage;
  const endCursor = data?.repositoryOwner?.repositories.pageInfo.endCursor;

  const loadMoreRepos = async () => {
    if (hasNextPage && !loading && !isFetching.current) {
      isFetching.current = true;
      await fetchMore({
        variables: { login, after: endCursor },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult?.repositoryOwner) return prevResult;

          return {
            ...prevResult,
            repositoryOwner: {
              ...prevResult.repositoryOwner,
              repositories: {
                ...prevResult.repositoryOwner?.repositories,
                nodes: [
                  ...(prevResult.repositoryOwner?.repositories.nodes || []),
                  ...(fetchMoreResult.repositoryOwner.repositories.nodes || []),
                ],
                pageInfo: fetchMoreResult.repositoryOwner.repositories.pageInfo,
              },
            },
          };
        },
      });
      isFetching.current = false;
    }
  };

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollHeight - scrollTop <= clientHeight + 50) {
        loadMoreRepos();
      }
    };

    const container = scrollRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, endCursor]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-prose">
      <Input
        name="login"
        label="Логин GitHub"
        placeholder="Введите логин для поиска репозиториев"
        value={login}
        onChange={e => setLogin(e.target.value)}
      />
      <div
        ref={scrollRef}
        className="flex flex-col gap-3 overflow-auto h-[500px]"
      >
        {repos.map(repo =>
          repo ? <RepoCard key={repo.id} repo={repo} /> : null
        )}
      </div>
      {loading && <Spinner className="self-center" />}
      {!!login && !loading && !repos.length && <p>Репозитории не найдены</p>}
    </div>
  );
};
