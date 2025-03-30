// Script pour créer un utilisateur de test dans Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://tzcrdermwcrbxordhnvr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6Y3JkZXJtd2NyYnhvcmRobnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzMjUyODksImV4cCI6MjA1ODkwMTI4OX0.5zI_Sfbn3xRh1AlhLdmNoX0CSkoUM_1bnJnME-VBO8o';

// Création du client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Informations de l'utilisateur de test
const testUser = {
  email: 'utilisateur.test@gmail.com',
  password: 'Password123!',
  firstName: 'Utilisateur',
  lastName: 'Test'
};

// Fonction pour créer l'utilisateur
async function createTestUser() {
  try {
    console.log(`Création de l'utilisateur de test avec l'email: ${testUser.email}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          first_name: testUser.firstName,
          last_name: testUser.lastName
        }
      }
    });
    
    if (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error.message);
      return;
    }
    
    console.log('Utilisateur créé avec succès!');
    console.log('ID de l\'utilisateur:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Nom complet:', `${testUser.firstName} ${testUser.lastName}`);
    console.log('\nVous pouvez maintenant vous connecter avec:');
    console.log(`Email: ${testUser.email}`);
    console.log(`Mot de passe: ${testUser.password}`);
    
    // Vérifier si l'email de confirmation est nécessaire
    if (data.user.confirmation_sent_at) {
      console.log('\nUn email de confirmation a été envoyé. Vérifiez votre boîte de réception.');
    } else {
      console.log('\nAucun email de confirmation n\'a été envoyé. Vous pouvez vous connecter immédiatement.');
    }
  } catch (err) {
    console.error('Exception lors de la création de l\'utilisateur:', err);
  }
}

// Exécuter la fonction
createTestUser();
