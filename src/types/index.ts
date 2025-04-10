
export interface User {
  id: string;
  email: string;
  nom_complet?: string;
  niveau_compte: 'free' | 'plus' | 'pro';
  date_inscription: string;
}

export interface Property {
  id: string;
  user_id: string;
  nom: string;
  adresse: string;
  ville: string;
  code_postal: string;
  pays: string;
  type: string;
  nombre_chambres: number;
  statut: 'actif' | 'inactif';
  created_at: string;
  updated_at: string;
}

export interface Roommate {
  id: string;
  propriete_id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  statut: 'actif' | 'inactif';
  montant_loyer: number;
  date_entree: string;
  date_sortie?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  propriete_id: string;
  colocataire_id?: string;
  type: 'revenu' | 'depense';
  montant: number;
  date: string;
  statut: 'complété' | 'en attente' | 'annulé';
  description?: string;
  categorie?: string;
  created_at: string;
  updated_at: string;
}

// Add a Database interface to help TypeScript understand our Supabase schema
export interface Database {
  public: {
    Tables: {
      proprietes: {
        Row: Property;
      };
      colocataires_new: {
        Row: Roommate;
      };
      transactions_new: {
        Row: Transaction;
      };
      profils: {
        Row: User;
      };
    };
  };
}
