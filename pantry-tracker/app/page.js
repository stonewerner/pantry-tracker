'use client'
import Image from "next/image";
import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { firestore, auth } from '@/firebase'
import {Box, Modal, Typography, Stack, TextField, Button, AppBar, Toolbar, IconButton, InputAdornment} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
//^ all of the html ish elements we use
import debounce from 'lodash/debounce';
import {collection, deleteDoc, doc, query, getDocs, getDoc, setDoc, where} from 'firebase/firestore'
import { signOut } from 'firebase/auth';
import SignIn from '@/components/SignIn';
import SignUp from '@/components/SignUp';
import WelcomeScreen from '@/components/WelcomeScreen';

export default function Home() {
  const { user, signInAnonymously } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const updateInventory = async () => {
    if (!user) return;
    const snapshot = query(collection(firestore, 'inventory'), where("userId", "==", user.uid));
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  //calls inventory whenever something changes in dependency list
  //because it is empty, it only runs when page loads
  useEffect(() => {
    if (user) 
    {updateInventory()}
  }, [user])


  //search logic
  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventory;
    return inventory.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  const debouncedSearch = useMemo(
    () => debounce((query) => setSearchQuery(query), 300),
    []
  );

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchVisible(false);
  };


  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {quantity} = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1, userId: user.uid });
      }
    }
    await updateInventory()
  }

  const addItem = async (item, quantity1) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const {quantity} = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1, userId: user.uid });
    } else {
      await setDoc(docRef, {quantity: quantity1, userId: user.uid })

    }
    await updateInventory()
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously();
    } catch (error) {
      console.error("Error signing in anonymously:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

//page if user is not signed in
  if (!user) {
    return (
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={2}
      >
        <WelcomeScreen
          onSignIn={() => setShowSignIn(true)}
          onSignUp={() => setShowSignUp(true)}
          onAnonymous={handleAnonymousSignIn}
        />
        {showSignUp ? <SignUp /> : <SignIn />}
        <Button onClick={() => setShowSignUp(!showSignUp)}>
          {showSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </Button>
      </Box>
    );
  }




  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      >
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Inventory Management
          </Typography>
          {isSearchVisible ? (
            <TextField
              variant="standard"
              placeholder="Search inventory..."
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={clearSearch}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              style={{ marginRight: '16px', color: 'white' }}
          />
        ) : (
            <IconButton color="inherit" onClick={() => setIsSearchVisible(true)}>
              <SearchIcon />
            </IconButton>
          )}
          <Button color="inherit" onClick={handleSignOut}>Sign Out</Button>
        </Toolbar>
      </AppBar>
      <Modal open={open} onClose={handleClose}>
        <Box
        position="absolute"
        top="50%"
        left="50%"
        width={400}
        bgcolor="white"
        border="2px solid #000"
        boxShadow={24}
        p={4}
        display="flex"
        flexDirection="column"
        gap={3}
        sx={{
          transform: 'translate(-50%,-50%)',
        }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
            label="Item Name"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => {
              setItemName(e.target.value)
            }}
            ></TextField>
            <TextField
              label="Quantity"
              type="number"
              variant="outlined"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <Button variant="contained" onClick={()=> {
              addItem(itemName, itemQuantity)
              setItemName('')
              setItemQuantity(1)
              handleClose() //because we are closing the db
            }}>Add</Button>

          </Stack>

        </Box>

      </Modal>
      
      <Button variant="contained" p={3} onClick={()=> {
        handleOpen()
      }}>Add new Item</Button>
      <Box border="1px solid #333" display="flex" flexDirection="column" width="800px" maxWidth="90vw" maxHeight="calc(100vh - 200px)" overflow="hidden">
        <Box width="100%" bgcolor="#ADD8E6" alignItems="center" justifyContent="center" display="flex" p={2}>
          <Typography variant="h3" color="#333">Current Inventory</Typography>
        </Box>
      <Stack width="100%" minHeight="300px" spacing={2} overflow="auto" flexGrow={1} p={2}>
        {filteredInventory.length > 0 ? (
          filteredInventory.map(({name, quantity}) => (
            <Box
            key={name}
            width="100%"
            minHeight="150px"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            bgColor="#f0f0f0"
            padding={5}>
              <Typography variant="h3" color="#333" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h3" color="#333" textAlign="center">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={()=> {
                addItem(name)
              }}>Add (+)</Button>
              <Button variant="contained" onClick={()=> {
                removeItem(name)
              }}>Remove (-)</Button>
            </Stack></Box>
            
        ))
        ) : (
          <Typography variant="h6" textAlign="center">
            No items found matching your search.
          </Typography>
        )
        }

      </Stack>
      </Box>
    </Box>

  );
}

//todo
//install material icons
//<MenuIcon />
//<ClearIcon />
//add a search icon top right of app bar
