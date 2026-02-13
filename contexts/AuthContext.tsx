/**
 * Authentication Context
 *
 * Gère l'état d'authentification de l'utilisateur avec Supabase Auth
 * US-5.1, US-5.2, US-5.3 : Inscription, Connexion, Déconnexion
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { useFavoritesStore } from '../store/favoritesStore';
import { useNotificationStore } from '../store/notificationStore';
import { Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Required for web browser auth
WebBrowser.maybeCompleteAuthSession();

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        // Load favorites and register notifications on initial session
        useFavoritesStore.getState().fetchFavorites();
        useNotificationStore.getState().register();
        useNotificationStore.getState().loadPreferences();
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
        // Load favorites and notifications when user logs in
        useFavoritesStore.getState().fetchFavorites();
        useNotificationStore.getState().register();
        useNotificationStore.getState().loadPreferences();
      } else {
        setProfile(null);
        setLoading(false);
        // Clear favorites and notifications when user logs out
        useFavoritesStore.getState().clearFavorites();
        useNotificationStore.getState().reset();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Charger le profil utilisateur depuis Supabase
   * Crée automatiquement le profil s'il n'existe pas (cas Google Sign-In)
   */
  const loadProfile = async (userId: string) => {
    try {
      // Use maybeSingle() to avoid error when profile doesn't exist
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        setLoading(false);
        return;
      }

      // If profile exists, use it
      if (data) {
        setProfile(data as UserProfile);
        setLoading(false);
        return;
      }

      // Profile doesn't exist - create it (happens with Google Sign-In)
      await createProfileForOAuthUser(userId);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  /**
   * Créer un profil pour les utilisateurs OAuth (Google, etc.)
   */
  const createProfileForOAuthUser = async (userId: string) => {
    try {
      // Get user metadata from auth
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Extract info from Google metadata
      const fullName = user.user_metadata?.full_name ||
                       user.user_metadata?.name ||
                       user.email?.split('@')[0] || '';

      // Upsert the profile (insert or update if exists)
      const { data: newProfile, error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          first_name: fullName.split(' ')[0] || '',
          last_name: fullName.split(' ').slice(1).join(' ') || '',
        }, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (upsertError) {
        console.error('Error upserting profile for OAuth user:', upsertError);
        setLoading(false);
        return;
      }

      setProfile({
        id: userId,
        email: user.email || '',
        full_name: fullName,
        created_at: new Date().toISOString(),
        ...newProfile,
      } as UserProfile);
    } catch (error) {
      console.error('Error creating OAuth profile:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inscription d'un nouvel utilisateur
   */
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);

      // Créer le compte utilisateur avec les metadata
      // Le profil sera créé automatiquement via le trigger PostgreSQL
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      Alert.alert(
        'Compte créé !',
        'Vérifiez votre email pour confirmer votre inscription.'
      );
    } catch (error: any) {
      console.error('Error signing up:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer le compte');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Connexion d'un utilisateur existant
   */
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Le profil sera chargé automatiquement via onAuthStateChange
    } catch (error: any) {
      console.error('Error signing in:', error);
      Alert.alert(
        'Erreur de connexion',
        error.message || 'Email ou mot de passe incorrect'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Connexion avec Google OAuth
   */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      // Create the redirect URL for the app
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'gart-app',
        path: 'auth/callback',
      });

      // Start OAuth flow with Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open the browser for authentication
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type === 'success' && result.url) {
          // Extract tokens from the URL
          const url = new URL(result.url);
          const params = new URLSearchParams(url.hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            // Set the session in Supabase
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) throw sessionError;
          }
        }
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      Alert.alert(
        'Erreur de connexion',
        error.message || 'Impossible de se connecter avec Google'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déconnexion de l'utilisateur
   */
  const signOut = async () => {
    try {
      setLoading(true);
      // Clear favorites before signing out
      useFavoritesStore.getState().clearFavorites();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing out:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Réinitialisation du mot de passe
   */
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'gart://reset-password',
      });

      if (error) throw error;

      Alert.alert(
        'Email envoyé',
        'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.'
      );
    } catch (error: any) {
      console.error('Error resetting password:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible d\'envoyer l\'email de réinitialisation'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mettre à jour le profil utilisateur
   */
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Recharger le profil
      await loadProfile(user.id);

      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rafraîchir le profil utilisateur
   */
  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook pour utiliser le contexte d'authentification
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
