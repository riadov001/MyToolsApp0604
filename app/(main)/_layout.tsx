import { Stack } from "expo-router";
import React from "react";
import { vexo } from 'vexo-analytics';

// Initialize Vexo at the root level, outside of any component
if (__DEV__ === false) {
  vexo('b9e49521-9e1e-4f84-887e-75cc01c5d173');
}

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="new-quote" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="quote-detail" options={{ headerShown: false }} />
      <Stack.Screen name="invoice-detail" options={{ headerShown: false }} />
      <Stack.Screen name="reservation-detail" options={{ headerShown: false }} />
      <Stack.Screen name="chat-detail" options={{ headerShown: false }} />
      <Stack.Screen name="delete-account" options={{ headerShown: false }} />
      <Stack.Screen name="request-reservation" options={{ headerShown: false }} />
    </Stack>
  );
}
