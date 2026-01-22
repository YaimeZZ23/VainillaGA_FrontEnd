import React from 'react';
import Layout from '../components/common/Layout';
import MangaDetail from '../components/manga/MangaDetail';
import ComentariosManga from '../components/manga/ComentariosManga';

/**
 * Página de detalle de manga
 */
function MangaDetailPage() {
  return (
    <Layout>
      <MangaDetail />
    </Layout>
  );
}

export default MangaDetailPage;