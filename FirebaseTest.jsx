// src/FirebaseTest.jsx
import React, { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, addDoc, getDocs } from "firebase/firestore"; 

function FirebaseTest() {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);

  const addUser = async (e) => {
    e.preventDefault();  
    try {
        const docRef = await addDoc(collection(db, "users"), {
          name: name,
          createdAt: new Date()
        });
        console.log("Document written with ID: ", docRef.id);
        setName("");
        fetchUsers();
    } catch (e) {
        console.error("Error adding document: ", e);
    }
  };

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setUsers(usersList);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: "20px", border: "2px solid red", margin: "20px" }}>
      <h3>Firebase Connection Test</h3>
      <form onSubmit={addUser}>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a name"
        />
        <button type="submit">Add User</button>
      </form>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default FirebaseTest;