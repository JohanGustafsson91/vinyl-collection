import { useState } from "react";
import { AlbumType, getAlbums } from "api/albums";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import styled from "styled-components";
import { breakpoint, space } from "theme";

import { Album } from "components/Album";
import { Filter, FilterOptions } from "components/Filter";
import { chainError, logger } from "utils";

const Home = ({
  albums,
  status,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [filteredAlbums, setFilteredAlbums] = useState(albums);

  function handleFilterAlbums({ query, includeTrack }: FilterOptions) {
    if (query === "") {
      return setFilteredAlbums(albums);
    }

    const albumsFiltered = albums.filter(function filterAlbum(album) {
      const matchArtist = album.artist
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchTitle = album.title
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchTrack = includeTrack
        ? album.tracks.some(function textIncludesString(track) {
            return track.title.toLowerCase().includes(query.toLowerCase());
          })
        : false;

      return [matchArtist, matchTitle, matchTrack].some(Boolean);
    });

    setFilteredAlbums(albumsFiltered);
  }

  return (
    <div>
      <Head>
        <title>Vinyl Collection</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Header>
          <Title>Vinyl Collection</Title>
          <Filter onFilter={handleFilterAlbums} />
        </Header>

        <Content>
          <AlbumList>
            {filteredAlbums.map(function renderAlbum(album) {
              return <Album album={album} key={album.id} />;
            })}
          </AlbumList>
          {status === "rejected" && (
            <p>
              <i>Something went wrong when fetching albums</i>
            </p>
          )}
        </Content>
      </Container>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<{
  albums: AlbumType[];
  status: "resolved" | "rejected";
}> = async () => {
  console.time(getAlbums.name);
  const albums = await getAlbums().catch(chainError("Could not get albums"));
  console.timeEnd(getAlbums.name);

  if (albums instanceof Error) {
    logger.error(albums.stack);

    return {
      props: { albums: [], status: "rejected" },
    };
  }

  return {
    props: { albums, status: "resolved" },
  };
};

const Container = styled.div`
  position: relative;
  width: 100%;
  max-width: 68em;
  padding: 0 ${space(3)};
  margin: ${space(0)} auto ${space(0)} auto;

  ${breakpoint(1)} {
    padding: 0 ${space(4)};
    margin: 0 auto ${space(4)} auto;
  }
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  display: flex;
  flex: 1;
  justify-content: center;
  padding: ${space(2)} 0 ${space(4)} 0;
  flex-direction: column;
  background-color: var(--color-background);
  z-index: var(--zIndex-overlay);

  ${breakpoint(0)} {
    flex-direction: row;
    align-items: center;
    padding: ${space(3)} 0;
  }

  ${breakpoint(1)} {
    flex-direction: row;
    align-items: center;
    padding: ${space(4)} 0;
  }
`;

const Content = styled.div``;

const Title = styled.h1`
  font-weight: 500;
  flex: 1;
  margin: ${space(2)} 0 ${space(3)} 0;
  padding: 0;
`;

const AlbumList = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-column-gap: ${space(4)};
  grid-row-gap: ${space(3)};
  padding-top: ${space(1)};

  ${breakpoint(0)} {
    grid-template-columns: repeat(2, minmax(232px, 1fr));
    grid-row-gap: ${space(3)};
  }

  ${breakpoint(1)} {
    grid-template-columns: repeat(auto-fit, minmax(232px, 1fr));
    grid-row-gap: ${space(5)};
  }
`;

export default Home;
