import React, { useState } from 'react';
import { auth, googleProvider, facebookProvider } from './firebase-config';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  EmailAuthProvider,
  signOut,
  sendPasswordResetEmail // Import nou
} from 'firebase/auth';
import { 
  VStack, 
  Input, 
  Button, 
  useToast, 
  Heading, 
  Box, 
  Text, 
  Link, 
  InputGroup, 
  InputRightElement, 
  IconButton 
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingCredential, setPendingCredential] = useState(null);
  const [existingEmail, setExistingEmail] = useState('');
  const [error, setError] = useState('');
  const [showEmailLinkForm, setShowEmailLinkForm] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false); // Nou: stare pentru a indica dacă emailul de resetare a fost trimis
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Autentificare reușită!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      handleCredential(result.user);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      handleCredential(result.user);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleAuthError = async (error) => {
    let errorMessage = '';

    if (error.code === 'auth/account-exists-with-different-credential') {
      const pendingCred = error.credential;
      const email = error.customData.email;

      setPendingCredential(pendingCred);
      setExistingEmail(email);

      const providers = await fetchSignInMethodsForEmail(auth, email);
      if (providers.includes('password')) {
        errorMessage = 'Există deja un cont cu acest email. Vă rugăm să vă autentificați folosind parola pentru a uni conturile.';
        setShowEmailLinkForm(true);
      } else {
        errorMessage = 'Există deja un cont cu acest email.';
        setShowEmailLinkForm(false);
      }
    } else if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Credentialele furnizate sunt invalide, în trecut v-ați conectat cu una dintre metodele de mai sus cu acest email';
    } else if (error.code === 'auth/user-cancelled') {
      errorMessage = 'Autentificarea a fost anulată. Puteți încerca din nou cu un alt cont.';
      await signOut(auth);
    } else if (error.code === 'auth/missing-identifier') {
      errorMessage = 'Adresa de email este necesară.';
    } else {
      errorMessage = error.message;
    }
    setError(errorMessage);
  };

  const handleCredential = async (user) => {
    try {
      const email = user.email;
      const providers = await fetchSignInMethodsForEmail(auth, email);
      if (providers.includes('password')) {
        await linkWithCredential(user, EmailAuthProvider.credential(email, password));
        toast({
          title: 'Conturile au fost unite cu succes!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleLinkWithEmail = async (e) => {
    e.preventDefault();
    try {
      if (pendingCredential && existingEmail) {
        const emailCredential = EmailAuthProvider.credential(existingEmail, password);
        const userCredential = await signInWithEmailAndPassword(auth, existingEmail, password);
        await linkWithCredential(userCredential.user, pendingCredential);
        toast({
          title: 'Conturile au fost unite cu succes!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setPendingCredential(null);
        setExistingEmail('');
        setPassword('');
        setShowEmailLinkForm(false);
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  // Funcție nouă pentru resetarea parolei
  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: 'Emailul de resetare a parolei a fost trimis!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setResetEmailSent(true);
    } catch (error) {
      toast({
        title: 'Eroare la trimiterea emailului de resetare',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box className="login-container" maxWidth="400px" margin="auto" padding="20px" borderRadius="10px" backgroundColor="#f9f9f9">
      <Heading size="lg" className="welcome-heading" textAlign="center" marginBottom="15px">
        Bine ai revenit 👋
      </Heading>
      <Text className="login-text" textAlign="center" marginBottom="10px">
        Pentru a continua, vă rugăm să vă autentificați.
      </Text>

      <VStack as="form" onSubmit={handleLogin} spacing={4} className="form-container" width="100%">
        <Heading size="md" className="login-heading" textAlign="center">
          Autentificare
        </Heading>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="login-input"
        />
        <InputGroup>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolă"
            required
            className="login-input"
          />
          <InputRightElement width="4.5rem">
            <IconButton
              h="1.75rem"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
              aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
            />
          </InputRightElement>
        </InputGroup>
        <Button type="submit" colorScheme="teal" className="login-button">
          Autentificare
        </Button>
      </VStack>

      <Text className="login-text" textAlign="center" marginTop="15px">
        Sau autentifică-te folosind:
      </Text>
      <VStack spacing={2} className="social-login-container">
        <Button colorScheme="red" className="social-login-button" onClick={handleGoogleLogin}>
          Autentificare cu Google
        </Button>
        <Button colorScheme="facebook" className="social-login-button" onClick={handleFacebookLogin}>
          Autentificare cu Facebook
        </Button>
      </VStack>

      {error && <Text color="red.500" textAlign="center" mt={4}>{error}</Text>}
      
      {showEmailLinkForm && (
        <Box as="form" onSubmit={handleLinkWithEmail} mt={4}>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduceți parola pentru contul existent"
              required
            />
            <InputRightElement width="4.5rem">
              <IconButton
                h="1.75rem"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
              />
            </InputRightElement>
          </InputGroup>
          <Button type="submit" colorScheme="green" mt={3}>
            Unește conturile
          </Button>
        </Box>
      )}

      <Text className="create-account-text" textAlign="center" marginTop="15px">
        Nu ai un cont? <Link href="/signup" color="teal.500">Creare cont</Link>
      </Text>

      {!resetEmailSent && (
        <Text textAlign="center" marginTop="10px">
          <Link color="teal.500" onClick={handlePasswordReset}>
            Ați uitat parola?
          </Link>
        </Text>
      )}
    </Box>
  );
}

export default Login;
