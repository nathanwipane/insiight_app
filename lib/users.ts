// ── lib/users.ts ─────────────────────────────────────────────────────────

import { hashPassword } from "./passwords"
import axios from "axios"
import apiClient from "./config"


export async function createUser(userData: {
  email: string
  password: string
  first_name: string
  last_name: string,
  organisation_id: string,
  role_id: Number,
  new?: Number
}, parent_org_id:string) {
  // Hash the password before storing
  try {
    const hashedPassword = await hashPassword(userData.password)
    userData.password = hashedPassword;
    // Debug environment variables

    const response = await apiClient.post('/store-new-user', {...userData, parent_org_id});
  
    if (response.status === 409) {
      return "User already exists";
    }
    if (response.status !== 200) {
      console.error("Could not create user, response code:", response.status);
      return null
    }
    const user = response.data.data.user;
    return user
  }
  catch(error){
    console.error("Error creating user:", error);
    return null;
  }
 
}


