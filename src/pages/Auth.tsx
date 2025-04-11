
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';

interface FormValues {
  email: string;
  password: string;
  nom_complet?: string;
}

export default function Auth() {
  const { signIn, signUp, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register: registerLogin, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors } } = useForm<FormValues>();
  const { register: registerSignup, handleSubmit: handleSignupSubmit, formState: { errors: signupErrors } } = useForm<FormValues>();

  const onLogin = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await signIn(data.email, data.password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignup = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (data.nom_complet) {
        await signUp(data.email, data.password, { nom_complet: data.nom_complet });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate if buttons should be disabled based on local submission state, not global loading state
  const isButtonDisabled = isSubmitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900">CoRent</h1>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Gestion de colocation pour propriétaires
          </h2>
        </div>

        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Connexion</CardTitle>
                <CardDescription>
                  Connectez-vous pour accéder à votre espace propriétaire.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLoginSubmit(onLogin)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nom@exemple.com"
                      {...registerLogin('email', { required: 'Email requis' })}
                    />
                    {loginErrors.email && (
                      <p className="text-sm text-red-500">{loginErrors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      {...registerLogin('password', { required: 'Mot de passe requis' })}
                    />
                    {loginErrors.password && (
                      <p className="text-sm text-red-500">{loginErrors.password.message}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isButtonDisabled}>
                    {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Inscription</CardTitle>
                <CardDescription>
                  Créez un compte pour gérer vos propriétés en colocation.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignupSubmit(onSignup)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom_complet">Nom complet</Label>
                    <Input
                      id="nom_complet"
                      placeholder="Jean Dupont"
                      {...registerSignup('nom_complet', { required: 'Nom requis' })}
                    />
                    {signupErrors.nom_complet && (
                      <p className="text-sm text-red-500">{signupErrors.nom_complet.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="nom@exemple.com"
                      {...registerSignup('email', { required: 'Email requis' })}
                    />
                    {signupErrors.email && (
                      <p className="text-sm text-red-500">{signupErrors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      {...registerSignup('password', { 
                        required: 'Mot de passe requis',
                        minLength: { value: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' } 
                      })}
                    />
                    {signupErrors.password && (
                      <p className="text-sm text-red-500">{signupErrors.password.message}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isButtonDisabled}>
                    {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="mt-4">
          <p className="text-center text-sm text-gray-600">
            <Link to="/" className="font-medium text-primary hover:text-primary-dark">
              Retour à l'accueil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
