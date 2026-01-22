import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import CarruselMangas from '../components/manga/CarruselMangas';
import CarruselMangasRecientes from '../components/manga/CarruselMangasRecientes';
import CarruselRecomendaciones from '../components/personal/CarruselRecomendaciones';
import { LOGO_URL } from '../utils/constants';
/**
 * Página Home - Página principal de la aplicación
 * Muestra la lista completa de mangas disponibles
 */
function HomePage() {
  return (
    <Layout>
      <div className="space-y-10">
        <CarruselMangasRecientes titulo="Últimos mangas actualizados" idSeccion="recientes" />
        <CarruselMangas titulo="Mangas destacados" idSeccion="mangas" />
        <CarruselRecomendaciones titulo="Recomendaciones para ti" idSeccion="recomendaciones" />

        <section className="card p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <img
              src={LOGO_URL}
              alt="Logo VanillaGA"
              className="h-16 w-16 object-cover rounded-full border border-primary-500 shadow-lg"
            />
            <div>
              <h2 className="text-2xl font-semibold text-gray-100 mb-2">
                Explora toda la biblioteca
              </h2>
              <p className="text-gray-400 max-w-2xl">
                Hay podras buscar, filtrar y administrar de forma mucho mas versatil todo mi conenido
              </p>
            </div>
          </div>
          <Link to="/buscar" className="btn-primary flex items-center space-x-3">
            <span>Ir al motor de búsqueda</span>
          </Link>
        </section>
      </div>
    </Layout>
  );
}

export default HomePage;