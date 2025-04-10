
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Users, CreditCard, PieChart } from 'lucide-react';

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      title: 'Gestion de propriétés',
      description: 'Ajoutez et gérez toutes vos propriétés en location dans une interface simple.',
      icon: <Home className="h-10 w-10 text-primary" />,
    },
    {
      title: 'Suivi des colocataires',
      description: 'Gardez une trace de tous vos colocataires, leurs loyers et leurs dates d\'entrée/sortie.',
      icon: <Users className="h-10 w-10 text-primary" />,
    },
    {
      title: 'Transactions financières',
      description: 'Enregistrez tous les revenus et dépenses pour une vision claire de vos finances.',
      icon: <CreditCard className="h-10 w-10 text-primary" />,
    },
    {
      title: 'Dashboard analytique',
      description: 'Visualisez vos flux financiers et recevez des alertes pour les loyers impayés.',
      icon: <PieChart className="h-10 w-10 text-primary" />,
    },
  ];

  const plans = [
    {
      name: 'Free',
      price: '0€',
      description: 'Pour les propriétaires débutants',
      features: ['1 propriété', 'Gestion des colocataires', 'Suivi financier de base'],
      highlighted: false,
    },
    {
      name: 'Plus',
      price: '9,99€',
      description: 'Pour les petits investisseurs',
      features: ['3 propriétés', 'Gestion des colocataires', 'Suivi financier complet', 'Alertes personnalisées'],
      highlighted: true,
    },
    {
      name: 'Pro',
      price: '24,99€',
      description: 'Pour les investisseurs expérimentés',
      features: ['Propriétés illimitées', 'Gestion avancée des colocataires', 'Rapports détaillés', 'Support prioritaire'],
      highlighted: false,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">CoRent</h1>
          </div>
          <div>
            <Link to="/auth">
              <Button>Connexion / Inscription</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/20 to-primary/5 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-1/2">
                <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                  Simplifiez la gestion de vos colocations
                </h2>
                <p className="mt-4 text-xl text-gray-600">
                  Une solution complète pour suivre les paiements de loyer, gérer vos colocataires et optimiser le cash-flow de vos propriétés.
                </p>
                <div className="mt-8">
                  <Link to="/auth">
                    <Button size="lg" className="mr-4">
                      Commencer gratuitement
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg">
                    En savoir plus
                  </Button>
                </div>
              </div>
              <div className="mt-10 lg:mt-0 lg:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60" 
                  alt="Gestion de colocation" 
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Fonctionnalités</h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
                Tout ce dont vous avez besoin pour gérer efficacement vos propriétés en colocation.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div key={index} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">Plans tarifaires</h2>
              <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto">
                Choisissez le plan qui correspond à vos besoins immobiliers.
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {plans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-lg shadow-lg overflow-hidden ${plan.highlighted ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className={`px-6 py-8 ${plan.highlighted ? 'bg-primary text-white' : 'bg-gray-50'}`}>
                    <h3 className="text-2xl font-medium">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-extrabold">{plan.price}</span>
                      <span className="ml-1 text-xl font-medium">/mois</span>
                    </div>
                    <p className="mt-2 text-sm">{plan.description}</p>
                  </div>
                  <div className="px-6 pt-6 pb-8">
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="ml-3 text-gray-700">{feature}</p>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <Link to="/auth">
                        <Button 
                          className="w-full" 
                          variant={plan.highlighted ? 'default' : 'outline'}
                        >
                          Commencer
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-xl font-bold">CoRent</h3>
              <p className="mt-2 text-gray-300">© 2023 CoRent. Tous droits réservés.</p>
            </div>
            <div>
              <ul className="flex space-x-6">
                <li><a href="#" className="hover:text-primary">Mentions légales</a></li>
                <li><a href="#" className="hover:text-primary">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
