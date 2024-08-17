// src/App.js
import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Button,
  Input,
  Flex,
  Text,
  VStack,
  Heading,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import {
  db,
  auth
} from './firebase-config';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import Login from './Login';
import SignUp from './SignUp';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const toast = useToast();

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to tasks collection updates
  useEffect(() => {
    let unsubscribeTasks;
    if (currentUser) {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', currentUser.uid)
      );

      unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        const fetchedTasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(fetchedTasks);
      });
    } else {
      setTasks([]);
    }

    return () => {
      if (unsubscribeTasks) unsubscribeTasks();
    };
  }, [currentUser]);

  const handleAddTask = async () => {
    if (newTask.trim() === '') {
      toast({
        title: 'Sarcina nu poate fi goală!',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (currentUser) {
      try {
        await addDoc(collection(db, 'tasks'), {
          text: newTask,
          completed: false,
          userId: currentUser.uid,
        });
        setNewTask('');
        toast({
          title: 'Sarcină adăugată cu succes!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Eroare la adăugarea sarcinii',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleToggleTask = async (id) => {
    const task = tasks.find((task) => task.id === id);
    if (!task) return;

    const taskDoc = doc(db, 'tasks', id);

    try {
      await updateDoc(taskDoc, {
        completed: !task.completed,
      });
      toast({
        title: `Sarcina a fost ${task.completed ? 'marcată ca incompletă' : 'completată'}!`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Eroare la actualizarea sarcinii',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id);
    try {
      await deleteDoc(taskDoc);
      toast({
        title: 'Sarcină ștearsă cu succes!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Eroare la ștergerea sarcinii',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Deconectare reușită!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Eroare la deconectare',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <ChakraProvider>
      <Box p={6}>
        {currentUser ? (
          <VStack spacing={4}>
            <Heading>To-Do List</Heading>
            <Button onClick={handleLogout} colorScheme="teal">
              Deconectează-te
            </Button>

            <VStack spacing={2} align="stretch">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Adaugă o nouă sarcină"
                size="md"
              />
              <Button
                onClick={handleAddTask}
                colorScheme="teal"
                sx={{
                  padding: '1rem 2rem',
                  fontSize: '1.2rem',
                }}
              >
                Adaugă Sarcină
              </Button>
            </VStack>

            <VStack spacing={2} align="stretch">
              {tasks.map((task) => (
                <Flex
                  key={task.id}
                  align="center"
                  bg={task.completed ? 'green.100' : 'gray.100'}
                  p={3}
                  borderRadius="md"
                >
                  <Text
                    flex={1}
                    as={task.completed ? 's' : 'p'}
                    onClick={() => handleToggleTask(task.id)}
                    cursor="pointer"
                  >
                    {task.text}
                  </Text>
                  <IconButton
                    aria-label="Șterge sarcina"
                    icon={<DeleteIcon />}
                    onClick={() => handleDeleteTask(task.id)}
                  />
                </Flex>
              ))}
            </VStack>
          </VStack>
        ) : (
          <Login />
        )}
      </Box>
    </ChakraProvider>
  );
}

export default App;
