// lib/password.ts
import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  // Salt rounds: 12 is a good balance between security and performance
  // Higher = more secure but slower (10-12 is recommended)
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}