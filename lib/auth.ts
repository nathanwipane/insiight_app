// lib/auth.ts
import { getUserByEmail, getUserByEmailWithPermissions, getUserFromCommon} from './database'
import { comparePassword } from './passwords'
import { User } from '@/constants/types'
import apiClient from '@/lib/config'


// DEPRECATED - no longer used. All auth goes through
// getUserAndParentFromCommon. Safe to delete in future cleanup.
export async function authenticateUser(email: string, password: string, parent_org_id: string): Promise<User | null> {
  try {
    // 1. Get user from database
    const user = await getUserByEmailWithPermissions(email, parent_org_id)
    if (!user) {
      return null // User doesn't exist
    }
    // 2. Compare provided password with stored hash
    const isValidPassword = await comparePassword(password, user.hashed_password)
    if (!isValidPassword) {
      console.log('Invalid password')
      return null // Invalid password
    }
    // 3. Check account status
    if (user.status !== 'active') {
      return null // Account inactive/banned
    }
    // 4. Return user data (without password hash)
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      org_id: user.org_id,
      last_login: user.last_login,
      parent_org_id: parent_org_id,
      role_id: user.role_id,
      permissions: user.permissions
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}


export const updateLastLogin = async (jwtToken: string): Promise<void> => {
  try {
    let res = await apiClient.put(`/v2/update-user-login`, {} ,{
      headers: { Authorization: `Bearer ${jwtToken}` }
    })
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}



export async function getUserAndParentFromCommon(email: string, password: string,): Promise<User | null> {
  try {
    // 1. Get user from database
    const { user, parent } = await getUserFromCommon(email)

    if (!user) {
      return null // User doesn't exist
    }
    // 2. Compare provided password with stored hash
    const isValidPassword = await comparePassword(password, user.hashed_password)
    if (!isValidPassword) {
      console.log('Invalid password')
      return null // Invalid password
    }
    // 3. Check account status
    if (user.status !== 'active') {
      return null // Account inactive/banned
    }
    // 4. Return user data (without password hash)
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      org_id: user.org_id,
      last_login: user.last_login,
      parent_org_id: parent.parent_org_id,
      role_id: user.role_id,
      permissions: user.permissions,
      org_name: parent.client_name ?? "",
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

