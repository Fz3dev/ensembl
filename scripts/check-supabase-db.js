// Script pour vérifier la configuration de la base de données Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://tzcrdermwcrbxordhnvr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6Y3JkZXJtd2NyYnhvcmRobnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMjUyODksImV4cCI6MjA1ODkwMTI4OX0.5zI_Sfbn3xRh1AlhLdmNoX0CSkoUM_1bnJnME-VBO8o';

// Création du client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour vérifier les utilisateurs
async function checkUsers() {
  try {
    console.log('=== VÉRIFICATION DES UTILISATEURS ===');
    
    // Vérification de l'utilisateur actuel
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('Erreur lors de la récupération de l\'utilisateur actuel:', authError.message);
    } else if (authData.user) {
      console.log('Utilisateur actuellement authentifié:', authData.user.email);
    } else {
      console.log('Aucun utilisateur actuellement authentifié');
    }
    
    console.log('\n');
  } catch (err) {
    console.error('Exception lors de la vérification des utilisateurs:', err);
  }
}

// Fonction pour vérifier les tables publiques
async function checkPublicTables() {
  try {
    console.log('=== VÉRIFICATION DES TABLES PUBLIQUES ===');
    
    // Liste des tables à vérifier
    const tables = [
      'profiles',
      'families',
      'family_members',
      'children',
      'events',
      'event_templates'
    ];
    
    for (const table of tables) {
      // Vérifier si la table existe en essayant de récupérer une ligne
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') { // Table doesn't exist
          console.log(`❌ Table '${table}' n'existe pas`);
        } else {
          console.log(`❌ Erreur lors de l'accès à la table '${table}':`, error.message);
        }
      } else {
        console.log(`✅ Table '${table}' existe${data.length > 0 ? ' et contient des données' : ' mais est vide'}`);
      }
    }
    
    console.log('\n');
  } catch (err) {
    console.error('Exception lors de la vérification des tables publiques:', err);
  }
}

// Fonction pour vérifier les politiques RLS
async function checkRLS() {
  try {
    console.log('=== VÉRIFICATION DES POLITIQUES RLS ===');
    console.log('Note: Cette vérification est limitée car nous ne pouvons pas lister directement les politiques via l\'API.');
    console.log('Vérifiez manuellement les politiques RLS dans le dashboard Supabase pour chaque table.');
    console.log('\n');
  } catch (err) {
    console.error('Exception lors de la vérification des politiques RLS:', err);
  }
}

// Fonction pour vérifier les fonctions et triggers
async function checkFunctionsAndTriggers() {
  try {
    console.log('=== VÉRIFICATION DES FONCTIONS ET TRIGGERS ===');
    console.log('Note: Cette vérification est limitée car nous ne pouvons pas lister directement les fonctions et triggers via l\'API.');
    console.log('Vérifiez manuellement les fonctions et triggers dans le dashboard Supabase.');
    console.log('\n');
  } catch (err) {
    console.error('Exception lors de la vérification des fonctions et triggers:', err);
  }
}

// Fonction pour vérifier les buckets de stockage
async function checkStorage() {
  try {
    console.log('=== VÉRIFICATION DES BUCKETS DE STOCKAGE ===');
    
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('Erreur lors de la récupération des buckets de stockage:', error.message);
    } else if (data.length === 0) {
      console.log('Aucun bucket de stockage trouvé');
    } else {
      console.log(`${data.length} bucket(s) de stockage trouvé(s):`);
      data.forEach(bucket => {
        console.log(`- ${bucket.name} (${bucket.public ? 'public' : 'privé'})`);
      });
    }
    
    console.log('\n');
  } catch (err) {
    console.error('Exception lors de la vérification des buckets de stockage:', err);
  }
}

// Fonction principale
async function checkSupabaseDB() {
  console.log('=== VÉRIFICATION DE LA BASE DE DONNÉES SUPABASE ===');
  console.log(`URL: ${supabaseUrl}`);
  console.log('Date:', new Date().toLocaleString());
  console.log('\n');
  
  await checkUsers();
  await checkPublicTables();
  await checkRLS();
  await checkFunctionsAndTriggers();
  await checkStorage();
  
  console.log('=== VÉRIFICATION TERMINÉE ===');
}

// Exécuter la fonction principale
checkSupabaseDB();
