import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Property } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('proprietes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setProperties(data || []);
      } catch (error: any) {
        console.error('Error fetching properties:', error);
        toast({
          title: "Error",
          description: "Failed to load properties.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user]);

  const propertyLimit = user?.niveau_compte === 'free' ? 1 : 
                        user?.niveau_compte === 'plus' ? 3 : Infinity;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {properties.length < propertyLimit && (
          <Button onClick={() => navigate('/properties/new')}>
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Button>
        )}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <Card key={property.id} className="bg-white shadow-md rounded-md">
              <CardHeader>
                <CardTitle>{property.nom}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{property.adresse}, {property.ville}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Get started by adding your first property.
            </p>
            <Button onClick={() => navigate('/properties/new')}>
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Button>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
