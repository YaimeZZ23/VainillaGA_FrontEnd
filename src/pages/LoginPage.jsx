import React from 'react';
import Layout from '../components/common/Layout';
import LoginForm from '../components/auth/LoginForm';

/**
 * Página Login - Formulario de inicio de sesión
 */
function LoginPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <LoginForm />
      </div>
    </Layout>
  );
}

export default LoginPage;