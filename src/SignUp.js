import React, { useState } from 'react';
import { auth } from './firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { VStack, Input, Button, useToast, Heading, Text, InputGroup, InputRightElement, IconButton } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import './SignUp.css'; // Importă fișierul CSS pentru stilizare

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Stare pentru vizibilitatea parolei
  const [error, setError] = useState(''); // Stochează mesajul de eroare
  const toast = useToast();
  const navigate = useNavigate();

  const errorMessages = {
    'auth/email-already-in-use': 'Această adresă de email este deja utilizată.',
    'auth/invalid-email': 'Adresa de email introdusă nu este validă.',
    'auth/weak-password': 'Parola trebuie să aibă cel puțin 6 caractere.',
    // Poți adăuga mai multe erori aici dacă este necesar
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); // Resetăm mesajul de eroare la fiecare submit
    try {
      // Creează un cont nou cu email și parolă
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Mesaj de succes la crearea contului
      toast({
        title: 'Cont creat cu succes!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Redirecționează către pagina principală după crearea contului
      navigate('/'); // Ruta corectă pentru aplicația de To-Do List
    } catch (error) {
      // Verifică dacă există un mesaj de eroare personalizat pentru codul de eroare primit
      const errorMessage = errorMessages[error.code] || 'A apărut o eroare. Vă rugăm să încercați din nou.';
      setError(errorMessage); // Setăm mesajul de eroare pentru afișare

      // Afișează toast cu eroarea
      toast({
        title: 'Eroare la crearea contului',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack as="form" onSubmit={handleSignUp} spacing={4} className="sign-up-container">
      <Heading size="md" className="sign-up-heading">Creare Cont 🎫</Heading>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="sign-up-input"
      />
      {error && (
        <Text color="red.500" className="sign-up-error">
          {error}
        </Text>
      )}
      <InputGroup className="password-input-group">
        <Input
          type={showPassword ? 'text' : 'password'} // Schimbă tipul în funcție de vizibilitatea parolei
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parolă"
          required
          className="sign-up-input"
        />
        <InputRightElement className="password-eye-icon">
          <IconButton
            h="2rem"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
            aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'}
            variant="unstyled" // Îndepărtează stilul implicit al butonului
          />
        </InputRightElement>
      </InputGroup>
      <Button type="submit" colorScheme="teal" className="sign-up-button">
        Continuă
      </Button>
    </VStack>
  );
}

export default SignUp;
