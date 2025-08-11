"use client";

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

const UserProfile = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      // Store/update user in MongoDB when they authenticate
      const storeUser = async () => {
        try {
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.emailAddresses[0]?.emailAddress,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImage: user.imageUrl,
              clerkId: user.id,
              lastLoginAt: new Date()
            })
          });

          if (response.ok) {
            const { user: dbUser } = await response.json();
            console.log('User stored/updated in MongoDB:', dbUser);
          } else {
            console.error('Failed to store user in MongoDB');
          }
        } catch (error) {
          console.error('Error storing user:', error);
        }
      };

      storeUser();
    }
  }, [isLoaded, user]);

  // This component doesn't render anything visible
  return null;
};

export default UserProfile;

