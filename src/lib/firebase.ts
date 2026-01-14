/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import dataConnect from "@/config/data-connect"
import {
	getAuth,
	GoogleAuthProvider,
	initializeAuth,
	signInWithPopup,
	signOut as firebaseSignOut,
	onAuthStateChanged,
} from "firebase/auth";
import { updateUser } from "@app/data";
import { firebaseConfig } from "@/config/firebaseConfig";

export const app = initializeApp(firebaseConfig);

// Set up Firebase Data Connect with the settings from /src/config/data-connect.ts
export const dc = dataConnect(app);
const ai = getAI(app);

export const getSearchEnabledModel = () => {
  return getGenerativeModel(ai, {
    model: "gemini-3-pro-preview", 
    tools: [{ googleSearch: {} }]
  });
};

export const auth = getAuth(app);

export const signIn = () => {
	signInWithPopup(auth, new GoogleAuthProvider());
};
export const signOut = () => {
	firebaseSignOut(auth);
};
onAuthStateChanged(auth, async (user) => {
	if (user && !localStorage.getItem("savedUser")) {
		await updateUser(dc, {
			username: user.email?.split("@")[0]!,
			displayName: user.displayName,
			imageUrl: user.photoURL,
		});
		localStorage.setItem("savedUser", "true");
	}
});
