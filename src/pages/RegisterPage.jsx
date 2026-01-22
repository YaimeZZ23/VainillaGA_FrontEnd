import React from 'react';
import Layout from '../components/common/Layout';
import RegisterForm from '../components/auth/RegisterForm';

/**
 * Página Register - Formulario de registro
 */
function RegisterPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <RegisterForm />
      </div>
    </Layout>
  );
}

export default RegisterPage;